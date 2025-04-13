'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.API_URL}/projects`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.data || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="relative mb-10">
        {/* Theme toggle button */}
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">DocSpace Translation Management</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Manage DocSpace i18n localization files</p>
        </div>
      </div>

      <div className="card max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Projects</h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">Loading projects...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No projects available. Server might not be running.
          </div>
        )}
        
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link 
                href={`/projects/${project.name}`} 
                key={project.name}
                className="card hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{project.path}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
