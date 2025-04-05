from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Task, Comment, Attachment
from .serializers import TaskSerializer, CommentSerializer, AttachmentSerializer
from teams.models import TeamMembership


class TaskFilter(filters.FilterSet):
    """Filter for tasks."""
    
    team = filters.NumberFilter(field_name='team_id')
    status = filters.CharFilter(field_name='status')
    priority = filters.CharFilter(field_name='priority')
    assigned_to = filters.NumberFilter(field_name='assigned_to_id')
    created_by = filters.NumberFilter(field_name='created_by_id')
    due_date_before = filters.DateTimeFilter(field_name='due_date', lookup_expr='lte')
    due_date_after = filters.DateTimeFilter(field_name='due_date', lookup_expr='gte')
    
    class Meta:
        model = Task
        fields = ['team', 'status', 'priority', 'assigned_to', 'created_by']


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing task instances."""
    
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user_teams = TeamMembership.objects.filter(user=self.request.user).values_list('team_id', flat=True)
        return Task.objects.filter(team_id__in=user_teams)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        task = self.get_object()
        serializer = AttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        status_value = request.data.get('status')
        
        if status_value not in dict(Task.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status value'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.status = status_value
        task.save()
        return Response(TaskSerializer(task).data)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs['task_pk'], author=self.request.user)


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Attachment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs['task_pk'], uploaded_by=self.request.user)
