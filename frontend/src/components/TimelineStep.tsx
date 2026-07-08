import React from "react";
import type { IconType } from "react-icons";
import { Badge } from "./Badge";
import { motion } from "framer-motion";

interface TimelineStepProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: IconType;
  status: "completed" | "active" | "pending";
  progressThreshold: number;
  stageProgress?: number;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  stepNumber,
  title,
  description,
  icon: Icon,
  status,
  stageProgress,
}) => {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isPending = status === "pending";

  let statusBadge = <Badge tone="default">Pending</Badge>;
  if (isCompleted) {
    statusBadge = <Badge tone="success">Completed</Badge>;
  } else if (isActive) {
    statusBadge = (
      <Badge tone="accent" className="animate-pulse">
        {stageProgress !== undefined ? `Active: ${stageProgress}%` : "Active"}
      </Badge>
    );
  }

  return (
    <div
      className={`relative rounded-[1.8rem] border border-brand-line/40 bg-white/80 p-5 shadow-sm transition-all duration-500 ${
        isPending ? "opacity-50 grayscale-[30%]" : "opacity-100"
      }`}
    >
      {isCompleted && (
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-[1.8rem] bg-gradient-to-b from-brand-terracotta to-brand-sand" />
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg transition-all duration-300 ${
              isCompleted
                ? "bg-brand-success/10 text-brand-success"
                : isActive
                ? "bg-brand-terracotta/15 text-brand-terracotta font-bold scale-105"
                : "bg-brand-line/30 text-brand-ink-light"
            }`}
          >
            <Icon />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <Badge tone="default">Step {stepNumber}</Badge>
              <p className="text-lg font-bold tracking-tight text-brand-ink">
                {title}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-brand-ink-light/95">
              {description}
            </p>
          </div>
        </div>
        <div className="w-fit">{statusBadge}</div>
      </div>
      
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-line/35">
        <motion.div
          className={`h-full rounded-full ${
            isCompleted
              ? "bg-brand-success"
              : "bg-gradient-to-r from-brand-terracotta to-brand-sand"
          }`}
          initial={{ width: 0 }}
          animate={{ width: isCompleted ? "100%" : isActive ? `${stageProgress || 50}%` : "0%" }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};
