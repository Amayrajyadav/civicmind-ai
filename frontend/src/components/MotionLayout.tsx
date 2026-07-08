import React from "react";
import { motion } from "framer-motion";
import { defaultTransition } from "@/motion/config";

interface MotionLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionLayout: React.FC<MotionLayoutProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};
