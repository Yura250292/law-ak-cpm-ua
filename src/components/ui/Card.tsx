import type { ReactNode } from "react";

interface CardProps {
  children?: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`px-7 pt-7 pb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return (
    <div className={`px-7 py-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={`text-lg font-bold text-primary leading-snug ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: CardProps) {
  return (
    <p className={`mt-2 text-sm text-muted leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={`px-7 pb-7 pt-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
