'use client';

import { useState, useEffect } from 'react';
import { decodeToken } from '@/lib/auth';

export const useRole = (): string | null => {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(decodeToken()?.role ?? null); }, []);
  return role;
};

export const useIsAdmin = (): boolean => useRole() === 'admin';
