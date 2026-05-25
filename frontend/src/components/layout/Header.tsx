'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { decodeToken } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
  '/projects': 'Projects',
  '/projects/new': 'Add Project',
  '/clients': 'Clients',
  '/clients/new': 'Add Client',
  '/participations': 'Participations',
  '/participations/new': 'Add Participation',
  '/roles': 'Roles',
  '/statistics': 'Statistics',
};

function getTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.includes('/edit')) return 'Edit';
  return 'Page';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<ReturnType<typeof decodeToken>>(null);
  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    setUser(decodeToken());
    setFormattedDate(getFormattedDate());
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 sticky top-0 z-30 gap-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex-1">
        {getTitle(pathname)}
      </h1>

      <span className="text-xs text-slate-400 font-medium hidden md:block">
        {formattedDate}
      </span>

      {/* Dark / Light toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-200 shrink-0">
          {user ? user.firstName.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
            {user ? `${user.firstName} ${user.lastName}` : '—'}
          </p>
          <p className="text-[10px] text-slate-400 capitalize">{user?.role ?? ''}</p>
        </div>
      </div>
    </header>
  );
}
