'use client';

import React from 'react';
import { HelpIcon } from '@/components/shared/Tooltip';

interface FormFieldProps {
  label: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export default function FormField({
  label,
  helpText,
  required = false,
  children,
  error,
  className = ''
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <label className="block text-sm font-medium text-foreground leading-5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helpText && (
          <div className="flex-shrink-0 mt-0.5">
            <HelpIcon content={helpText} />
          </div>
        )}
      </div>
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">!</span>
          </span>
          {error}
        </p>
      )}
    </div>
  );
}

// Form Section with help
interface FormSectionProps {
  title: string;
  description?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  helpText,
  children,
  className = ''
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-card-border pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground leading-6">{title}</h3>
            {description && (
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            )}
          </div>
          {helpText && (
            <div className="flex-shrink-0 mt-1">
              <HelpIcon content={helpText} />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
