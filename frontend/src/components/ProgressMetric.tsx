import React from "react";
import { motion } from "framer-motion";

interface ProgressMetricProps {
  label: string;
  value: number; // 0 to 100
  compact?: boolean;
}

export const ProgressMetric: React.FC<ProgressMetricProps> = ({
  label,
  value,
  compact = false,
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value));

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-ink-light font-medium">{label}</span>
          <span className="font-bold text-brand-ink">{normalizedValue}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-line/25 p-[2px]">
          <div
            className="h-full rounded-full bg-brand-terracotta"
            style={{ width: `${normalizedValue}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-brand-ink">{label}</span>
        <span className="font-bold text-brand-terracotta">{normalizedValue}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-brand-line/30 p-[3px] border border-brand-line/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-terracotta to-brand-sand"
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
