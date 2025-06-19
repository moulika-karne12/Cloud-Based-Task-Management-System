from django.contrib import admin

# Register your models here.
from .models import TaskCategory, Task

admin.site.register(TaskCategory)
admin.site.register(Task)  # Also add this if not already registered