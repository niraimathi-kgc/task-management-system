from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Team, TeamMembership
from .serializers import TeamSerializer, TeamMembershipSerializer


class TeamViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing team instances."""
    
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        team = serializer.save(owner=self.request.user)
        TeamMembership.objects.create(
            team=team,
            user=self.request.user,
            role='ADMIN'
        )
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'MEMBER')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if team.owner != request.user and not team.teammembership_set.filter(
            user=request.user, role='ADMIN'
        ).exists():
            return Response(
                {'error': 'Only team owner or admin can add members'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            membership = TeamMembership.objects.create(
                team=team,
                user_id=user_id,
                role=role
            )
            serializer = TeamMembershipSerializer(membership)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if team.owner != request.user and not team.teammembership_set.filter(
            user=request.user, role='ADMIN'
        ).exists():
            return Response(
                {'error': 'Only team owner or admin can remove members'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            membership = team.teammembership_set.get(user_id=user_id)
            if membership.user == team.owner:
                return Response(
                    {'error': 'Cannot remove team owner'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            membership.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TeamMembership.DoesNotExist:
            return Response(
                {'error': 'User is not a member of this team'},
                status=status.HTTP_404_NOT_FOUND
            )
