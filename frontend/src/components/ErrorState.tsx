import React from "react";
import { HiMiniExclamationTriangle, HiMiniArrowPath } from "react-icons/hi2";
import { Card } from "./Card";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to sync connection",
  description = "Could not synchronize with the local servers. Please ensure the backend is running.",
  onRetry,
  className = "",
}) => {
  return (
    <Card className={`flex flex-col items-center justify-center p-12 text-center border-brand-terracotta/20 bg-brand-terracotta/5 ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-terracotta/15 text-brand-terracotta text-2xl">
        <HiMiniExclamationTriangle />
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-brand-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-brand-ink-light">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="mt-6 flex items-center gap-2">
          <HiMiniArrowPath className="text-base" /> Retry Connection
        </Button>
      )}
    </Card>
  );
};
