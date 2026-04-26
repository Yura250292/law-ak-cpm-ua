"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type ShimmerTextProps = {
  children: ReactNode;
  className?: string;
};

export function ShimmerText({ children, className }: ShimmerTextProps) {
  const reduce = useReducedMotion();

  return (
    <span className={`relative inline-block italic ${className ?? ""}`}>
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(110deg, #B8964F 0%, #E8D5A8 30%, #FFFFFF 50%, #E8D5A8 70%, #B8964F 100%)",
          backgroundSize: "250% 100%",
        }}
      >
        {children}
      </span>
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-clip-text text-transparent pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.95) 50%, transparent 70%)",
            backgroundSize: "250% 100%",
            WebkitTextStroke: "0",
          }}
          initial={{ backgroundPositionX: "200%" }}
          animate={{ backgroundPositionX: "-200%" }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
        >
          {children}
        </motion.span>
      )}
    </span>
  );
}
