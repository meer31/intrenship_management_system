import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={twMerge(
            clsx(
              'block w-full rounded-lg border text-sm text-text-primary placeholder:text-slate-400 transition-colors bg-white',
              'focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              'py-2 px-3.5',
              error ? 'border-danger focus:border-danger' : 'border-border',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
