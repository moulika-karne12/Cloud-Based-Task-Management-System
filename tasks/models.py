from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
# class User(models.Model):
#     username= models.CharField(max_length=100)
#     email = models.EmailField(unique=True)
#     def __str__(self):
#         return self.username

class CustomUser(AbstractUser):  # Inherits Django's authentication system
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username
    
class TaskCategory(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name
    
class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('Pending','Pending'), ('In Progress','In Progress'), ('Completed','Completed')])
    priority = models.IntegerField(default=1)
    category = models.ForeignKey(TaskCategory, on_delete=models.CASCADE)
    custom_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

class TaskAssignment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    custom_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)


