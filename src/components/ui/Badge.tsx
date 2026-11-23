import React from 'react';
import { ApplicationStatus, ReportStatus, EntityStatus } from '../../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  status?: ApplicationStatus | ReportStatus | EntityStatus | string;
  variant?: 'blue' | 'amber' | 'red' | 'purple' | 'teal' | 'green' | 'gray';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  children,
  size = 'md',
  dot = true,
  className,
}) => {
  let computedVariant = variant || 'gray';
  let label = children;

  if (status) {
    switch (status) {
      case 'APPLIED':
        computedVariant = 'blue';
        label = label || 'Applied';
        break;
      case 'PENDING_FOCAL_REVIEW':
        computedVariant = 'amber';
        label = label || 'Pending Focal Person Review';
        break;
      case 'REJECTED_BY_FOCAL':
        computedVariant = 'red';
        label = label || 'Rejected by Focal Person';
        break;
      case 'FORWARDED_TO_DIRECTOR':
        computedVariant = 'purple';
        label = label || 'Forwarded to Director';
        break;
      case 'APPROVED_BY_DIRECTOR':
        computedVariant = 'teal';
        label = label || 'Approved by Director';
        break;
      case 'REJECTED_BY_DIRECTOR':
        computedVariant = 'red';
        label = label || 'Rejected by Director';
        break;
      case 'COMPLETED':
        computedVariant = 'teal';
        label = label || 'Completed';
        break;
      case 'NOT_SUBMITTED':
        computedVariant = 'gray';
        label = label || 'Report Pending';
        break;
      case 'PENDING_REVIEW':
        computedVariant = 'amber';
        label = label || 'Report Submitted';
        break;
      case 'APPROVED':
        computedVariant = 'teal';
        label = label || 'Report Approved';
        break;
      case 'REVISIONS_REQUESTED':
        computedVariant = 'red';
        label = label || 'Revisions Requested';
        break;
      case 'ACTIVE':
        computedVariant = 'teal';
        label = label || 'Active';
        break;
      case 'INACTIVE':
        computedVariant = 'gray';
        label = label || 'Inactive';
        break;
      case 'DRAFT':
        computedVariant = 'amber';
        label = label || 'Draft';
        break;
      case 'ARCHIVED':
        computedVariant = 'gray';
        label = label || 'Archived';
        break;
    }
  }

  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotStyles = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    green: 'bg-emerald-500',
    gray: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full border shrink-0',
          variantStyles[computedVariant],
          sizeStyles[size],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[computedVariant])} />}
      <span>{label}</span>
    </span>
  );
};
