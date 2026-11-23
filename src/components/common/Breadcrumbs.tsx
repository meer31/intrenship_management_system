import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumbs: React.FC<{ items?: BreadcrumbItem[] }> = ({ items }) => {
  const location = useLocation();

  const generatedItems = React.useMemo(() => {
    if (items) return items;
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const label = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, path };
    });
  }, [location.pathname, items]);

  return (
    <nav className="flex items-center text-xs text-text-secondary mb-2" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-teal transition-colors flex items-center">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {generatedItems.map((item, index) => {
        const isLast = index === generatedItems.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3 w-3 mx-1.5 text-slate-400 shrink-0" />
            {isLast || !item.path ? (
              <span className="font-medium text-slate-700">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-teal transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
