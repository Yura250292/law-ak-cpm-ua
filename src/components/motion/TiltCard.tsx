"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import type { MouseEvent, ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  download?: boolean;
  max?: number;
};

export function TiltCard({
  children,
  className,
  href,
  download,
  max = 8,
}: TiltCardProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 200,
    damping: 18,
  });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 200,
    damping: 18,
  });

  function handleMove(e: MouseEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const props = {
    className,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    style: {
      rotateX: rx,
      rotateY: ry,
      transformPerspective: 800,
      transformStyle: "preserve-3d" as const,
    },
    whileHover: reduce ? undefined : { y: -4 },
    transition: { type: "spring" as const, stiffness: 220, damping: 20 },
  };

  if (href) {
    return (
      <motion.a href={href} download={download} {...props}>
        {children}
      </motion.a>
    );
  }

  return <motion.div {...props}>{children}</motion.div>;
}
