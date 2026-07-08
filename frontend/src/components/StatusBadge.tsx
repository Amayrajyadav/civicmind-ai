import React from "react";

interface StatusBadgeProps {
  status: "pending" | "processing" | "completed" | "failed" | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalizedStatus = status.toLowerCase();
  
  const styles = {
    pending: "bg-brand-sand/15 text-brand-terracotta border border-brand-sand/30",
    processing: "bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse",
    completed: "bg-brand-success/15 text-brand-success border border-brand-success/20",
    failed: "bg-red-500/10 text-red-600 border border-red-500/20",
  };

  const labels: Record<string, string> = {
    pending: "Queueing",
    processing: "Analyzing",
    completed: "Resolved",
    failed: "Halted",
  };

  const currentStyle = styles[normalizedStatus as keyof typeof styles] || "bg-brand-line/30 text-brand-ink-light";
  const currentLabel = labels[normalizedStatus] || status;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${currentStyle} ${className}`}>
      {currentLabel}
    </span>
  );
};
