import React from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-terracotta">
        {eyebrow}
      </p>
      <h2 className="text-balance text-4xl font-bold tracking-tight text-brand-ink md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-3xl text-base leading-7 text-brand-ink-light md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
};
