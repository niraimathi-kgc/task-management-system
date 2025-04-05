'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Return a placeholder with the same structure during SSR
  if (!mounted) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex items-center px-2 py-2 text-gray-700">
                Loading...
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/tasks" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Tasks
            </Link>
            <Link href="/teams" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Teams
            </Link>
          </div>
          <div className="flex items-center">
            {isAuthenticated && (
              <>
                <Link href="/profile" className="px-2 py-2 text-gray-700 hover:text-gray-900">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 