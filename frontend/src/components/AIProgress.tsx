import React from "react";
import { motion } from "framer-motion";

interface AIProgressProps {
  progress: number; // 0.0 to 1.0
  showText?: boolean;
  className?: string;
}

export const AIProgress: React.FC<AIProgressProps> = ({
  progress,
  showText = true,
  className = "",
}) => {
  const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const defaultTransition: any = { duration: 0.3, ease: "easeOut" } ;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={defaultTransition}
      className={`space-y-3 ${className}`}
    >
      {showText && (
        <div className="flex items-end justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
            Pipeline Progress
          </p>
          <p className="text-3xl font-bold tracking-tight text-brand-ink">
            {percentage}%
          </p>
        </div>
      )}
      
      <div className="h-3 overflow-hidden rounded-full bg-brand-terracotta/10 border border-brand-line/30 p-[2px]">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, #b97a57 0%, #d4a373 100%)"
          }}
        />
      </div>
    </motion.div>
  );
};
