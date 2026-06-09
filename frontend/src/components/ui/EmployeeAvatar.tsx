'use client';

import { useState } from 'react';
import { getPhotoUrl } from '@/lib/photoUrl';
import { Employee } from '@/types';

interface Props {
  employee: Pick<Employee, 'firstName' | 'lastName' | 'photo'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

export default function EmployeeAvatar({ employee, size = 'md', className = '' }: Props) {
  const photoUrl = getPhotoUrl(employee.photo);
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const cls = `${sizeClasses[size]} rounded-full shrink-0 ${className}`;
  const [imgError, setImgError] = useState(false);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={initials}
        className={`${cls} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${cls} bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold`}>
      {initials}
    </div>
  );
}
