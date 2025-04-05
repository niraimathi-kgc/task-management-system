from rest_framework import serializers
from .models import Team, TeamMembership
from users.serializers import UserSerializer


class TeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for team membership."""
    
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TeamMembership
        fields = ('id', 'team', 'user', 'user_id', 'role', 'joined_at')
        read_only_fields = ('id', 'joined_at')


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for teams."""
    
    owner = UserSerializer(read_only=True)
    members = TeamMembershipSerializer(
        source='teammembership_set',
        many=True,
        read_only=True
    )
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ('id', 'name', 'description', 'owner', 'members',
                 'member_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
        
    def get_member_count(self, obj):
        return obj.members.count()

    def create(self, validated_data):
        user = self.context['request'].user
        team = Team.objects.create(owner=user, **validated_data)
        TeamMembership.objects.create(
            team=team,
            user=user,
            role='ADMIN'
        )
        return team 