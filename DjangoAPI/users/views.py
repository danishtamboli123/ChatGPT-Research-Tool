from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from .models import User, Study
import jwt, datetime
import json
from rest_framework.exceptions import ValidationError, ParseError

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
