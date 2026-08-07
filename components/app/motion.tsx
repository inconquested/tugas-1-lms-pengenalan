"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Premium ease-out (matches the --animate-fade-in-up curve in global.css). Kept
// under 300ms and to transform/opacity only, per the app's motion guidelines.
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Slow glide + soft breath" spring — a deliberate, unhurried settle that overshoots
 * ~3% once (one soft breath) instead of bouncing. Shared by the teacher material
 * composer (chips gliding in) and the student material viewer (references revealing),
 * so both surfaces move with the same character. Transform/opacity only.
 */
export const SOFT_SPRING = {
  type: "spring",
  stiffness: 150,
  damping: 18,
  mass: 1,
} as const;

/** Linear 60ms step between staggered list items — even, calm cadence. */
export const STAGGER_STEP = 0.06;

/**
 * Subtle entrance for a section or block: fades + rises + settles from 0.98 scale.
 * Honors prefers-reduced-motion (renders static, no initial offset). Use around
 * hero blocks, cards, or grouped content — not around individual grid cells.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 10,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, scale: 0.98 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
