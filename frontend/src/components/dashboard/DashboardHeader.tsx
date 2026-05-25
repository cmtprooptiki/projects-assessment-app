'use client';

import { useMemo } from 'react';
import { decodeToken } from '@/lib/auth';

export default function DashboardHeader() {
  const user = useMemo(() => decodeToken(), []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {greeting()},{' '}
          <span className="text-indigo-600 dark:text-indigo-400">
            {user ? user.firstName : 'there'} 👋
          </span>
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Here's what's happening with your projects today.
        </p>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-0.5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user?.email}</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          Online
        </span>
      </div>
    </div>
  );
}
