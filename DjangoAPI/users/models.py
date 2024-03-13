from django.db import models
from django.contrib.auth.models import AbstractUser

USER_TYPE_CHOICES = (
    (1, 'participant'),
    (2, 'researcher'),)

# Create your models here.
class User(AbstractUser):
      
    name = models.CharField(max_length = 255)
    email =  models.CharField(max_length = 255, unique = True)
    password =  models.CharField(max_length = 255)
    username = None
    account_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES,default = False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

class Study(models.Model):
    study_id =  models.BigAutoField(auto_created=True, primary_key=True)
    study_name = models.CharField(max_length = 255)
    user_id = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES,default = False)
    irb_pdf = models.FileField(upload_to="irb_pdfs/")
    pre_study_questionnaire = models.CharField(max_length = 255)
    questions_list = models.JSONField()
    post_study_questionnaire = models.CharField(max_length = 255)

class StudyData(models.Model):
    study_id =  models.BigAutoField(auto_created=True, primary_key=True)
    user_id = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES,default = False)
    irb_pdf_signature = models.CharField(max_length = 255)
    pre_study_questionnaire_filled = models.BooleanField()
    questions_answers_list = models.JSONField()
    post_study_questionnaire_filled = models.BooleanField()
    study_completed = models.BooleanField()