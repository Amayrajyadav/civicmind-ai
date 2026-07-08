import React from "react";
import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  note?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  suffix = "",
  prefix = "",
  note,
  icon,
  className = "",
}) => {
  return (
    <Card className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-ink-light">
            {label}
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-brand-ink">
            {prefix}{value}{suffix}
          </p>
        </div>
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-terracotta/10 text-brand-terracotta text-lg">
            {icon}
          </div>
        )}
      </div>
      {note && (
        <p className="mt-4 text-xs leading-5 text-brand-ink-light/80 border-t border-brand-line/30 pt-3">
          {note}
        </p>
      )}
    </Card>
  );
};
