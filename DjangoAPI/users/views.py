import csv
import os
from django.http import FileResponse, HttpResponse
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, NotFound
from .serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from .models import User, Study, StudyData
import jwt, datetime
import json
from rest_framework.exceptions import ValidationError, ParseError
from openai import OpenAI

# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class LoginView(APIView):
    def post(self,request):
        email = request.data['email']
        password = request.data['password']
        user = User.objects.filter(email = email).first()

        if user is None:
            raise AuthenticationFailed("User does not exist.")
        
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect Password.")
        
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=2,minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')
        response = Response()

        response.set_cookie(key='jwt', value=token, httponly=True)
        response.data = {
            'jwt' : token
        }
        
        return response

class UserView(APIView):
    def get(self,request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed("Unauthenticated.")
        try:
            payload = jwt.decode(token, 'secret', algorithms =['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated.")

        user = User.objects.filter(id = payload['id']).first()
        serializer = UserSerializer(user)

        return Response(serializer.data)
    
class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {'message' : 'success'}

        return response
    
class CreateStudyView(APIView):
    def post(self,request):
        # print(request.data)
        StudyData = request.data
        StudyData["questions_list"] = json.loads(StudyData["questions_list"])
        if(Study.objects.filter(study_name = StudyData["study_name"], user_id = StudyData["user_id"]).count() == 0):
            temp_study = Study(questions_list = StudyData["questions_list"],
                    study_name = StudyData["study_name"],
                    user_id = StudyData["user_id"],
                    irb_pdf = StudyData["irb_pdf"],
                    pre_study_questionnaire = StudyData["pre_study_questionnaire"],
                    post_study_questionnaire = StudyData["post_study_questionnaire"],
                    )
            temp_study.save()
        else:
            raise ValidationError
        
        response = Response()
        response.data = {'message' : 'success'}

        return response
    
class ShowResearcherStudies(APIView):
    def get(self,request):
        ResearcherStudies = Study.objects.filter(user_id = request.GET.get('q',''))
        return Response(ResearcherStudies.all().values())

class EditStudyView(APIView):
    def get(self,request):
        studyNumber = request.GET.get('q', '')
        StudyData = Study.objects.filter(study_id = studyNumber).all()
        return Response(StudyData.all().values())
    
    def post(self,request):

        try:
            StudyData = Study.objects.filter(study_id = request.data['study_id']).all().first()
            StudyData.study_name = request.data['study_name']
            StudyData.pre_study_questionnaire = request.data['pre_study_questionnaire']
            StudyData.post_study_questionnaire = request.data['post_study_questionnaire']
            if(os.path.exists(StudyData.irb_pdf.path)):
                os.remove(StudyData.irb_pdf.path)
            StudyData.irb_pdf = request.data['irb_pdf']
            StudyData.questions_list = json.loads(request.data["questions_list"])
            StudyData.save()
        except:
            return Response({"err": "error"})
        
        response = Response()
        response.data = {'message' : 'success'}

        return response
    
class GetIRBFileView(APIView):
    def get(self,request):
        file_location = request.GET.get('q', '')

        try:    

            return FileResponse(open(file_location,'rb'),
                                    content_type='application/pdf',
                                    )

        except:
            # handle file not exist case here
            return Response({"err": "Failed"})
        
class DeleteStudy(APIView):
    def post(self, request):
        try:
            StudyData = Study.objects.filter(study_id = request.data['study_id']).all().first()
            if(os.path.exists(StudyData.irb_pdf.path)):
                os.remove(StudyData.irb_pdf.path)
            StudyData.delete()
        except:
            return Response({"err": "error"})
        
        return Response({"message": "success"})
    
class UserStudyData(APIView):
    def get(self,request):
        UserData = request
        StudyExists = Study.objects.filter(study_id = UserData.GET['study_id']).count() > 0
        if(StudyExists):
            UserStudyData = StudyData.objects.filter(study_id = UserData.GET['study_id'] , user_id = UserData.GET['user_id']).all()
            if(UserStudyData.count() > 0):
                if(UserStudyData.first().study_completed == True):
                    raise NotFound('You have already completed this study')
                else:
                    return Response({'study_exists':True,'study_data': UserStudyData.values()})
            else:
                currStudy = StudyData(study_id = UserData.GET['study_id'] , user_id = UserData.GET['user_id'])
                currStudy.save()
                UserStudyData = StudyData.objects.filter(study_id = UserData.GET['study_id'] , user_id = UserData.GET['user_id']).all()
                return Response({'study_exists':True,'study_data': UserStudyData.values()})
        else:
            raise NotFound('Invalid Study ID')
        
    def post(self,request):
        UserData = request.data
        try:
            Record = StudyData.objects.filter( study_id = UserData['study_id'], user_id = UserData['user_id']).all().first()
            for var in UserData:
                if var in ['pre_study_questionnaire_filled','post_study_questionnaire_filled']:
                    if UserData[var] == 'true':
                       setattr(Record, var, True)
                    else:
                        setattr(Record, var, False)
                else:
                    setattr(Record, var, UserData[var])
            Record.questions_answers_list = json.loads(UserData['questions_answers_list'])
            Record.study_completed = True
            Record.save()
            return Response({'message': 'successfully updated Participant Study Data'})
        except Exception as error:
            print(error)
            raise ValidationError

        
class GPTResponse(APIView):
    def get(self,request):
        client = OpenAI(api_key = "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")

        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": request.GET['prompt']}
        ]
        )
        answer = response.choices[0].message.content
        return Response({'answer':answer})

def DownloadStudyDataCSV(request):
    queryset = StudyData.objects.filter(study_id = request.GET['study_id']).all()
    opts = queryset.model._meta
    model = queryset.model
    response = HttpResponse(content_type='text/csv')
    # force download.
    response['Content-Disposition'] = 'attachment;filename=Study_Data.csv'
    # the csv writer
    writer = csv.writer(response)
    field_names = [field.name for field in opts.fields]
    # Write a first row with header information
    writer.writerow(field_names)
    # Write data rows
    for obj in queryset:
        writer.writerow([getattr(obj, field) for field in field_names])
    return response
