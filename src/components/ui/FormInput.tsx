import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

export const FormInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function FormInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn('form-input', className)} {...props} />;
  }
);

export const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function FormTextarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn('form-textarea', className)} {...props} />;
});
