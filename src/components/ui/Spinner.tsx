type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Завантаження"
      className={`inline-block animate-spin rounded-full border-primary/15 border-t-accent ${sizeClasses[size]} ${className}`}
    />
  );
}

export { Spinner };
export type { SpinnerProps };
