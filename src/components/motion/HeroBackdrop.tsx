"use client";

import { motion, useReducedMotion } from "motion/react";

export function HeroBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* warm ambient mesh — top right */}
      <motion.div
        aria-hidden
        className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle at center, rgba(201,169,110,0.22), transparent 70%)" }}
        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* soft cream pool — bottom left */}
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -left-32 h-[480px] w-[480px] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle at center, rgba(232,213,168,0.20), transparent 70%)" }}
        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* diagonal light sweep */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 -left-1/3 w-1/2 -skew-x-12"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            mixBlendMode: "soft-light",
          }}
          initial={{ x: "-40%", opacity: 0 }}
          animate={{ x: "260%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 3.2, delay: 0.8, ease: "easeInOut" }}
        />
      )}
      {/* fine grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(28,28,30,1) 1px, transparent 1px), linear-gradient(90deg, rgba(28,28,30,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}
