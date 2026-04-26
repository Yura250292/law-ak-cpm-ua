"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  whileInView?: boolean;
  once?: boolean;
};

export function Stagger({
  children,
  className,
  delayChildren = 0.1,
  staggerChildren = 0.12,
  whileInView = false,
  once = true,
}: StaggerProps) {
  const variants = {
    hidden: {},
    show: { transition: { delayChildren, staggerChildren } },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      {...(whileInView
        ? { whileInView: "show", viewport: { once, margin: "-80px" } }
        : { animate: "show" })}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  y?: number;
};

export function StaggerItem({ children, className, y = 20 }: StaggerItemProps) {
  const reduce = useReducedMotion();
  const variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
