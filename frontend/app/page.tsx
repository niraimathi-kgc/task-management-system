'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
}

export function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-primary-600">
            Task Management System
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Get started by{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
            logging in
          </Link>
          {' '}or{' '}
          <Link href="/auth/register" className="text-primary-600 hover:text-primary-500">
            creating an account
          </Link>
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <Link
            href="/tasks"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-primary-600 focus:text-primary-600"
          >
            <h3 className="text-2xl font-bold">Tasks &rarr;</h3>
            <p className="mt-4 text-xl">
              Manage your tasks and collaborate with your team.
            </p>
          </Link>

          <Link
            href="/teams"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-primary-600 focus:text-primary-600"
          >
            <h3 className="text-2xl font-bold">Teams &rarr;</h3>
            <p className="mt-4 text-xl">
              Create and manage teams for better collaboration.
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
} 