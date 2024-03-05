from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):

    USER_TYPE_CHOICES = (
    (1, 'participant'),
    (2, 'researcher'),)
      
    name = models.CharField(max_length = 255)
    email =  models.CharField(max_length = 255, unique = True)
    password =  models.CharField(max_length = 255)
    username = None
    account_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES,default = False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []