from rest_framework import serializers
from .models import Task, Comment, Attachment
from users.serializers import UserSerializer
from teams.serializers import TeamSerializer


class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for task attachments."""
    
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['id', 'task', 'file', 'filename', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for task comments."""
    
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for tasks."""
    
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    team_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'team', 'team_id',
            'created_by', 'assigned_to', 'assigned_to_id',
            'status', 'priority', 'due_date', 'created_at',
            'updated_at', 'comments', 'attachments'
        ]
        read_only_fields = ['created_at', 'updated_at']
        
    def create(self, validated_data):
        user = self.context['request'].user
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        team_id = validated_data.pop('team_id')
        
        task = Task.objects.create(
            created_by=user,
            assigned_to_id=assigned_to_id,
            team_id=team_id,
            **validated_data
        )
        return task 