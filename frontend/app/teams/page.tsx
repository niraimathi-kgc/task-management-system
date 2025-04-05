'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

interface TeamMember {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  members: TeamMember[];
  created_at: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulated data for now
      const mockTeams: Team[] = [
        {
          id: 1,
          name: "Frontend Team",
          description: "Responsible for the user interface and experience",
          members: [
            {
              id: 1,
              username: "john.doe",
              email: "john@example.com",
              role: "Team Lead"
            },
            {
              id: 2,
              username: "jane.smith",
              email: "jane@example.com",
              role: "Developer"
            }
          ],
          created_at: "2024-01-15"
        },
        {
          id: 2,
          name: "Backend Team",
          description: "Handles server-side logic and database management",
          members: [
            {
              id: 3,
              username: "bob.wilson",
              email: "bob@example.com",
              role: "Team Lead"
            }
          ],
          created_at: "2024-01-20"
        }
      ];

      setTeams(mockTeams);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <Button
            onClick={() => router.push('/teams/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Team
          </Button>
        </div>

        {/* Teams List */}
        {isLoading ? (
          <div className="text-center py-8">Loading teams...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {teams.map((team) => (
              <motion.div
                key={team.id}
                variants={itemVariants}
                className="cursor-pointer"
                onClick={() => router.push(`/teams/${team.id}`)}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {team.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{team.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Team Members ({team.members.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member) => (
                          <div
                            key={member.id}
                            className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1"
                          >
                            <span className="text-sm text-gray-700">
                              {member.username}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">
                              ({member.role})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Created: {new Date(team.created_at).toLocaleDateString()}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/teams/${team.id}/manage`);
                        }}
                      >
                        Manage Team
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
} 