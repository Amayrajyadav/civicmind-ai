import React, { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "accent" | "success" | "warning";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = "default",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-all duration-300";
  
  const tones = {
    default: "bg-brand-line/20 text-brand-ink-light border border-brand-line/30",
    accent: "bg-brand-terracotta/10 text-brand-terracotta border border-brand-terracotta/20",
    success: "bg-brand-success/10 text-brand-success border border-brand-success/20",
    warning: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  };

  return (
    <span
      className={`${baseStyles} ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
