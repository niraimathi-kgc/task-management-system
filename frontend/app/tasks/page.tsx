'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date: string;
  assigned_to: {
    id: number;
    username: string;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulated data for now
      const mockTasks: Task[] = [
        {
          id: 1,
          title: "Implement user authentication",
          description: "Set up JWT authentication for the application",
          status: "IN_PROGRESS",
          priority: "HIGH",
          due_date: "2024-03-25",
          assigned_to: {
            id: 1,
            username: "john.doe"
          }
        },
        {
          id: 2,
          title: "Create dashboard layout",
          description: "Design and implement the main dashboard layout",
          status: "TODO",
          priority: "MEDIUM",
          due_date: "2024-03-28",
          assigned_to: {
            id: 2,
            username: "jane.smith"
          }
        }
      ];

      setTasks(mockTasks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      TODO: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800'
    };
    return colors[priority];
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
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <Button
            onClick={() => router.push('/tasks/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Task
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <select
              className="form-select rounded-md border-gray-300"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select
              className="form-select rounded-md border-gray-300"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            >
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </Card>

        {/* Task List */}
        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                className="cursor-pointer"
                onClick={() => router.push(`/tasks/${task.id}`)}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-gray-600">{task.description}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>Assigned to: {task.assigned_to.username}</span>
                        <span>•</span>
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
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