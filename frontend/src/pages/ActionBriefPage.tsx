import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HiMiniArrowPath, 
  HiMiniPrinter, 
  HiMiniArrowDownTray,
  HiMiniDocumentCheck,
  HiMiniUserGroup,
  HiMiniCalendarDays
} from "react-icons/hi2";
import { Button } from "@/components/Button";

import { ErrorState } from "@/components/ErrorState";
import { dashboardService, type ActionBriefResponse } from "@/services/dashboardService";
import { SectionHeading } from "@/components/SectionHeading";

// Helper markdown parser to clean and render basic markdown safely
const parseMarkdownToReact = (text: string) => {
  if (!text) return null;
  // Handle literal escaped newlines from backend
  const cleanText = text.replace(/\\n/g, "\n");
  const lines = cleanText.split("\n");
  
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === "") return <div key={idx} className="h-3" />;

    // Inline formatting: bold **text**
    const renderInline = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold text-brand-ink">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-base font-bold text-brand-ink mt-5 mb-2 print:mt-3 print:mb-1">
          {renderInline(trimmed.replace("### ", ""))}
        </h4>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={idx} className="text-lg font-bold text-brand-ink mt-6 mb-3 border-b border-brand-line/20 pb-2 print:mt-4 print:mb-2">
          {renderInline(trimmed.replace("## ", ""))}
        </h3>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h2 key={idx} className="text-2xl font-extrabold text-brand-ink mt-8 mb-4 print:mt-4 print:mb-2">
          {renderInline(trimmed.replace("# ", ""))}
        </h2>
      );
    }
    
    // Bullet lists
    if (trimmed.match(/^[-*]\s+/)) {
      return (
        <li key={idx} className="ml-5 list-disc text-sm text-brand-ink-light leading-relaxed my-1.5 print:my-0.5 print:text-xs">
          {renderInline(trimmed.replace(/^[-*]\s+/, ""))}
        </li>
      );
    }

    // Numbered lists
    if (trimmed.match(/^\d+\.\s+/)) {
      return (
        <li key={idx} className="ml-5 list-decimal text-sm text-brand-ink-light leading-relaxed my-1.5 print:my-0.5 print:text-xs">
          {renderInline(trimmed.replace(/^\d+\.\s+/, ""))}
        </li>
      );
    }
    
    // Table rows (basic markdown table support)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.split("|").filter(c => c.trim() !== "");
      // If it's a separator row like |---|---|
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        return null;
      }
      return (
        <div key={idx} className="flex border-b border-brand-line/20 py-2 print:py-1">
          {cells.map((cell, i) => (
            <div key={i} className="flex-1 px-2 text-sm text-brand-ink-light print:text-xs">
              {renderInline(cell.trim())}
            </div>
          ))}
        </div>
      );
    }

    return (
      <p key={idx} className="text-sm leading-6 text-brand-ink-light my-2 print:text-xs print:leading-5 print:my-1">
        {renderInline(trimmed)}
      </p>
    );
  });
};

import { useLanguage } from "@/context/LanguageContext";

export const ActionBriefPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue_id") || "issue_001";

  // Data states
  const [brief, setBrief] = useState<ActionBriefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchBrief = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getActionBrief(issueId);
        if (isMounted) {
          setBrief(data);
        }
      } catch (err: any) {
        console.error("Action Brief fetch failure:", err);
        if (isMounted) {
          setError(
            err.response?.data?.detail || 
            "Failed to load the Action Brief from server. Check backend logs."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBrief();
    return () => {
      isMounted = false;
    };
  }, [issueId, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // Reuse the same printable DOM via window.print() which inherently generates the PDF
    window.print();
  };

  if (loading) {
    return (
      <div className="px-6 py-20 text-center space-y-4">
        <div className="h-10 w-10 mx-auto rounded-full bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta animate-spin">
          <HiMiniArrowPath className="text-xl" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-terracotta">
          Compiling Official Briefing Sheet...
        </p>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <ErrorState 
            title="Failed to Retrieve Brief" 
            description={error || "Grievance ID brief not available."} 
            onRetry={handleRetry} 
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="px-6 pb-12 pt-16 space-y-10 print:p-0 print:bg-white print:space-y-6"
    >

      {/* Title & Print buttons */}
      <div className="mx-auto max-w-5xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between print:hidden">
        <SectionHeading
          eyebrow={t("brief.eyebrow", "Executive Report")}
          title={t("brief.title", "Constituency Action Brief")}
          description={t("brief.description", "Printable strategy brief and scheme validation parameters for parliamentary review.")}
        />
        
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
            <HiMiniPrinter className="text-base" /> {t("brief.print", "Print Report")}
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-1.5 shadow-sm">
            <HiMiniArrowDownTray className="text-base" /> {t("brief.download", "Download Brief")}
          </Button>
        </div>
      </div>

      {/* Main printable paper container */}
      <div className="mx-auto max-w-5xl" id="printable-brief">
        <div className="rounded-[2.4rem] border border-brand-line/60 bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(73,54,43,0.04)] print:shadow-none print:border-none print:p-0">
          
          {/* Printable Header */}
          <div className="border-b-2 border-brand-ink/90 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-terracotta">
                  {t("brief.official", "Official Briefing Document")}
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">
                  {brief.title}
                </h1>
              </div>
              <span className="hidden print:inline-flex items-center gap-1 bg-brand-terracotta/5 border border-brand-terracotta/15 rounded-full px-3 py-1 text-xs font-bold text-brand-terracotta">
                CivicMind AI
              </span>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-brand-ink-light">
                <HiMiniDocumentCheck className="text-brand-terracotta text-sm" />
                <span>{t("brief.deptHeader", "Dept")}: <strong className="text-brand-ink">{brief.assigned_department}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-brand-ink-light">
                <HiMiniUserGroup className="text-brand-terracotta text-sm" />
                <span>Scope: <strong className="text-brand-ink">{brief.stakeholders.join(", ")}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-brand-ink-light">
                <HiMiniCalendarDays className="text-brand-terracotta text-sm" />
                <span>{t("brief.timelineHeader", "Timeline")}: <strong className="text-brand-ink">{brief.timeline}</strong></span>
              </div>
            </div>
          </div>

          {/* Core Brief Sections */}
          <div className="grid gap-8 py-8 md:grid-cols-[1.1fr_0.9fr] border-b border-brand-line/20">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-terracotta">
                {t("citizen.recentSignals", "Executive Intelligence Summary")}
              </h3>
              <p className="text-sm leading-7 text-brand-ink">
                {brief.executive_summary}
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-brand-line/60 bg-brand-cream/30 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                Financial Allocation Fit
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-brand-line/20 pb-2">
                  <span className="text-brand-ink-light text-xs">Estimated Cost</span>
                  <strong className="text-brand-ink text-base">{brief.budget_estimate}</strong>
                </div>
                
                <div className="flex items-center justify-between border-b border-brand-line/20 pb-2">
                  <span className="text-brand-ink-light text-xs">Assigned Department</span>
                  <span className="font-semibold text-brand-ink text-xs">{brief.assigned_department}</span>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <span className="text-brand-ink-light text-xs">Project Phase duration</span>
                  <span className="font-semibold text-brand-ink text-xs">{brief.timeline}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action steps timeline list */}
          <div className="py-8 border-b border-brand-line/20 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-terracotta">
              {t("brief.steps", "Phased Execution Steps")}
            </h3>
            
            <div className="space-y-4">
              {brief.action_steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-terracotta text-xs font-bold text-white shadow-sm shadow-brand-terracotta/20">
                    {idx + 1}
                  </span>
                  <p className="text-sm leading-6 text-brand-ink-light">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Render markdown full briefing sheet */}
          <div className="pt-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-terracotta print:hidden">
              Detailed AI Strategy Briefing
            </h3>
            
            <div className="rounded-[1.8rem] bg-brand-cream/20 p-6 md:p-8 border border-brand-line/40 max-h-[30rem] overflow-y-auto print:max-h-none print:p-0 print:border-none print:bg-transparent">
              {parseMarkdownToReact(brief.markdown_report)}
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center mt-6 print:hidden">
          <Link to={`/recommendation-details?issue_id=${issueId}`} className="text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:underline">
            ← Return to Recommendation Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
