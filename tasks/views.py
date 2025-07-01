from django.shortcuts import render, redirect, get_object_or_404
from rest_framework import viewsets
from .models import Task, TaskAssignment, TaskCategory
from .serializers import TaskSerializer, TaskCategorySerializer, TaskAssignmentSerializer
from .forms import TaskForm
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializers import CustomUserSerializer, CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import BasePermission
from django.http import HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# Create your views here.

#API-based views

User = get_user_model()

# class NoPagination(PageNumberPagination):
#     page_size = None
    
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for user list

    
# Custom permission: Admins can modify all tasks, users can only modify their own
class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.custom_user == request.user  # Admins OR task owners

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('priority','due_date')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]  # Require authentication  Authenticated users + Role-based control

    def perform_create(self, serializer):
        try:
            print("✅ request.user:", self.request.user)
            print("✅ request.data:", self.request.data)
            user = self.request.user
            assigned_user_id = self.request.data.get('custom_user')

            if user.is_staff and assigned_user_id:
                # Allow admin to assign the task to another user
                assigned_user = User.objects.get(id=assigned_user_id)
                serializer.save(custom_user=assigned_user)
            else:
                # Regular user: assign to themselves
                serializer.save(custom_user=user)
        except Exception as e:
            print("❌ Error while saving task:", str(e))
            raise e


    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if not request.user.is_staff and task.custom_user != request.user:  # Only allow admins to delete tasks
            return Response({"error": "You do not have permission to delete this task."}, status=403)
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all().order_by("id") if user.is_staff else Task.objects.filter(custom_user=user)

        # Optional query parameters
        status = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if status and status != "All":
            queryset = queryset.filter(status=status)

        if category and category != "All":
            queryset = queryset.filter(category__id=category)

        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    
    def perform_update(self, serializer):
        # //serializer.save(custom_user=self.request.user)
        serializer.save()        
        print("✏️ Updating task with:", self.request.data)


class TaskCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TaskCategory.objects.all()
    serializer_class = TaskCategorySerializer
    permission_classes = [IsAuthenticated]  # Require authentication
    pagination_class = None  # Disable pagination for categories

class IsAdminOnly(BasePermission):
    def has_permission(self, request, view, obj):
        return request.user.is_staff or obj.custom_user == request.user  # Only allow staff users

class TaskAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAssignment.objects.all()
    serializer_class = TaskAssignmentSerializer
    permission_classes = [IsAuthenticated, IsAdminOnly]  # Require authentication & # Only admins can assign tasks

#Template-based views
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
#@login_required#remove after react
def task_list(request):
    tasks = Task.objects.all()
    return render(request, 'tasks/task_list.html', {'tasks':tasks})

def task_create(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('task-list')
    else:
        form = TaskForm()
        return render(request, 'tasks/task_form.html',{'form':form})

@login_required   
def task_update(request, task_id):
    task = get_object_or_404(Task, id= task_id)

    # Ensure user is owner or admin
    if not request.user.is_staff and task.custom_user != request.user:
        return HttpResponseForbidden("You do not have permission to update this task.")
    
    if request.method =='POST':
        form = TaskForm(request.POST,instance=task)
        if form.is_valid():
            form.save()
            return redirect('task-list')
    else:
        form = TaskForm(instance=task)
        return render(request, 'tasks/task_form.html',{'form':form,'task':task})

@login_required
def task_delete(request, task_id):
    task = get_object_or_404(Task, id= task_id)
    # Ensure only admin can delete
    if not request.user.is_staff:
        return HttpResponseForbidden("You do not have permission to delete this task.")
    
    task.delete()
    return redirect('task-list')

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = CustomUserSerializer

# Custom Login View (uses Custom JWT Serializer)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Logout View (Blacklists Token)
class LogoutView(generics.GenericAPIView):
    serializer_class = None  # Explicitly set to None

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
