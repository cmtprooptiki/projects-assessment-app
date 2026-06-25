'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Briefcase, Link2, Shield,
  LogOut, BarChart3, BarChart2, Building2, Building, UserCog, FileText, FileDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { decodeToken } from '@/lib/auth';

const navItems: { href: string; label: string; icon: React.ElementType; exact?: boolean; adminOnly?: boolean }[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/departments', label: 'Departments', icon: Building },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/participations', label: 'Participations', icon: Link2 },
  { href: '/roles', label: 'Roles', icon: Shield },
  { href: '/statistics', label: 'Statistics', icon: BarChart2 },
  { href: '/cv', label: 'CV Export', icon: FileDown },
  { href: '/users', label: 'Users', icon: UserCog, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof decodeToken>>(null);
  useEffect(() => { setUser(decodeToken()); }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-200">
            <BarChart3 className="text-white" size={18} />
          </div>
          <div>
            <p className="text-slate-800 dark:text-slate-100 font-bold text-sm leading-tight">Projects</p>
            <p className="text-slate-400 text-xs font-medium">Assessment</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {navItems.filter(({ adminOnly }) => !adminOnly || user?.role === 'admin').map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Icon size={17} className={cn(active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            {user ? user.firstName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-700 dark:text-slate-200 text-xs font-semibold truncate">
              {user ? `${user.firstName} ${user.lastName}` : '—'}
            </p>
            <p className="text-slate-400 text-xs truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
