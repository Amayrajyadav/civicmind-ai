import React from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/context/LanguageContext";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="px-4 pb-8 pt-20">
      <div className="mx-auto max-w-[1440px] grid gap-8 rounded-[2rem] border border-brand-line/60 bg-white/70 px-6 py-8 shadow-[0_24px_60px_rgba(59,46,38,0.06)] md:grid-cols-[1.2fr_0.8fr] md:px-8 backdrop-blur-md">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-terracotta">
            CivicMind AI Platform
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-brand-ink">
            {t("footer.tagline", "Explainable decision intelligence for modern governance.")}
          </h3>
          <p className="max-w-xl text-sm leading-6 text-brand-ink-light/80">
            Automatically clustering citizen reports, matching public works schemes, and generating strategy-grade recommendations for local ward development.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-brand-ink-light">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink/80 mb-1">{t("nav.citizen", "Citizen Portal")}</span>
            <Link to="/citizen-portal" className="hover:text-brand-terracotta transition-colors">
              {t("nav.citizen", "Citizen Portal")}
            </Link>
            <Link to="/issue-submission" className="hover:text-brand-terracotta transition-colors">
              {t("nav.issueSubmission", "Grievance Submission")}
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink/80 mb-1">Executive</span>
            <Link to="/mp-dashboard" className="hover:text-brand-terracotta transition-colors">
              {t("nav.dashboard", "MP Dashboard")}
            </Link>
            <Link to="/ai-processing" className="hover:text-brand-terracotta transition-colors">
              {t("nav.aiProcessing", "AI Pipeline")}
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-brand-ink-light/60">
        &copy; {new Date().getFullYear()} {t("footer.rights", "CivicMind AI Platform. All rights reserved.")}
      </div>
    </footer>
  );
};
