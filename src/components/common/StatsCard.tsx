import React from 'react';
import { Card } from '../ui/Card';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'navy' | 'teal' | 'amber' | 'red' | 'purple' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'navy',
}) => {
  const colorStyles = {
    navy: 'bg-navy-50 text-navy',
    teal: 'bg-teal-50 text-teal',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-navy-900 tracking-tight">{value}</h3>
          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={`font-semibold ${
                    trend.isPositive ? 'text-teal' : 'text-danger'
                  }`}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && <span className="text-text-secondary">{subtitle}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
