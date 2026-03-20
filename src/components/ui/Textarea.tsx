"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, rows = 4, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-primary placeholder:text-muted-light transition-all duration-200 resize-y outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
            error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-border hover:border-muted-light"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
export { Textarea };
export type { TextareaProps };
