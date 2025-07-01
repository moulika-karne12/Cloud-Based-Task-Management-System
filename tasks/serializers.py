from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, TaskCategory, TaskAssignment, CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    custom_user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False
    )
    assigned_user = serializers.SerializerMethodField()
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['custom_user']  # ✅ Prevent frontend from needing to send this
        
    #This adds a new field assigned_user (just the name, not the whole user object) to each task response.
    def get_assigned_user(self, obj):
        return obj.custom_user.username if obj.custom_user else None

class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)  # Hashes password automatically
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username  # Add username to token payload
        token['is_staff'] = user.is_staff
        token['email'] = user.email
        return token
