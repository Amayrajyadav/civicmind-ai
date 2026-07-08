import React from "react";
import { HiMiniInbox } from "react-icons/hi2";
import { Card } from "./Card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "There are no records available in this directory yet.",
  action,
  className = "",
}) => {
  return (
    <Card className={`flex flex-col items-center justify-center p-12 text-center border-dashed border-brand-line/60 bg-white/50 ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-sand/10 text-brand-sand text-2xl">
        <HiMiniInbox />
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-brand-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-brand-ink-light/80">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
};
