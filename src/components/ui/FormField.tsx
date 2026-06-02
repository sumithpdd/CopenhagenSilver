'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormInput } from './FormInput';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, icon, error, hint, className, id, ...props },
  ref
) {
  const fieldId = id ?? props.name;

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label flex items-center gap-2">
        {icon && <span className="form-field__icon-label">{icon}</span>}
        {label}
      </label>
      <div className={cn('form-field__control', error && 'form-field__control--error')}>
        {icon && <span className="form-field__icon" aria-hidden>{icon}</span>}
        <FormInput
          ref={ref}
          id={fieldId}
          className={cn(icon && 'form-input--with-icon', className)}
          {...props}
        />
      </div>
      {error && <p className="form-field__error">{error}</p>}
      {hint && !error && <p className="form-field__hint">{hint}</p>}
    </div>
  );
});
