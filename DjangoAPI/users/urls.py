
from django.urls import include, path
from .views import RegisterView, LoginView, UserView, LogoutView, CreateStudyView, ShowResearcherStudies

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('user', UserView.as_view()),
    path('logout', LogoutView.as_view()),
    path('createStudy', CreateStudyView.as_view()),
    path('allStudies/', ShowResearcherStudies.as_view())
]
