'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string;
}

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

// Temporary UI components until we fix the module resolution
const Button = ({ 
  children, 
  className = '', 
  ...props 
}: ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: ReactNode;
  className?: string;
}) => (
  <button
    className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

export default function Dashboard() {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch tasks from API
        const tasksResponse = await fetch('http://localhost:8000/api/tasks/', {
          headers: {
            'Authorization': `Bearer ${authService.getAccessToken()}`
          }
        });

        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const tasksData = await tasksResponse.json();
        setRecentTasks(tasksData.results.slice(0, 5)); // Show only 5 most recent tasks

        // Fetch activities from API
        const activitiesResponse = await fetch('http://localhost:8000/api/activities/', {
          headers: {
            'Authorization': `Bearer ${authService.getAccessToken()}`
          }
        });

        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch activities');
        }

        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.results.slice(0, 5)); // Show only 5 most recent activities

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button
            onClick={() => router.push('/tasks/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Task
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </Card>
          <Card className="p-6 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">5</p>
          </Card>
          <Card className="p-6 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-3xl font-bold text-green-600">7</p>
          </Card>
        </div>

        {/* Recent Tasks and Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card className="p-6 shadow-lg rounded-lg bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-500">Due: {task.due_date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Feed */}
          <Card className="p-6 shadow-lg rounded-lg bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            {isLoading ? (
              <p>Loading activities...</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                    className="flex items-start space-x-3 p-3 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
} 