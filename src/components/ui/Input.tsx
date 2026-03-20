"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-12 rounded-xl border bg-white px-4 text-sm text-primary placeholder:text-muted-light transition-all duration-200 outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
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

Input.displayName = "Input";

export default Input;
export { Input };
export type { InputProps };
