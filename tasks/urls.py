from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskCategoryViewSet, TaskAssignmentViewSet, task_list, task_create, task_update, task_delete
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, LogoutView


router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'categories', TaskCategoryViewSet, basename='categories')
router.register(r'assignments', TaskAssignmentViewSet, basename='assignments')

urlpatterns = [
    path('', include(router.urls)),
    # path('tasks/', task_list, name='task-list'),
    # path('tasks/create/', task_create, name = 'task_create'),
    # path('tasks/update/<int:task_id>/', task_update, name = 'task_update'),
    # path('tasks/delete/<int:task_id>/', task_delete, name ='task_delete'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
]