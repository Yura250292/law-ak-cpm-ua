"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-primary font-bold hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25",
  secondary: "bg-primary text-white hover:bg-primary-light",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "text-muted hover:text-primary hover:bg-surface",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-5 text-sm gap-2",
  md: "h-12 px-7 text-sm gap-2",
  lg: "h-14 px-9 text-base gap-3",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { Button };
export type { ButtonProps };
