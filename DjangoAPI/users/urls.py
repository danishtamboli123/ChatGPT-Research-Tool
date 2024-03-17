
from django.urls import include, path
from .views import RegisterView, LoginView, UserView, LogoutView, CreateStudyView, ShowResearcherStudies, EditStudyView, GetIRBFileView, DeleteStudy, UserStudyData, GPTResponse

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('user', UserView.as_view()),
    path('logout', LogoutView.as_view()),
    path('createStudy', CreateStudyView.as_view()),
    path('allStudies/', ShowResearcherStudies.as_view()),
    path('editStudy/', EditStudyView.as_view()),
    path('getIRBFile/', GetIRBFileView.as_view()),
    path('deleteStudy/', DeleteStudy.as_view()),
    path('study/', UserStudyData.as_view()),
    path('chatgpt-response/',GPTResponse.as_view()),
]
