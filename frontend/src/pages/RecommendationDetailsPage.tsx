import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HiMiniArrowPath, 
  HiMiniDocumentText, 
  HiMiniBriefcase,
  HiMiniSparkles,
  HiMiniListBullet,
  HiMiniMapPin
} from "react-icons/hi2";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { SectionHeading } from "@/components/SectionHeading";
import { ErrorState } from "@/components/ErrorState";
import { dashboardService, type RecommendationResponse } from "@/services/dashboardService";
import { useLanguage } from "@/context/LanguageContext";


export const RecommendationDetailsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue_id") || "issue_001";

  // Data states
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);



  // Removed Demo auto-navigate hook

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getRecommendation(issueId);
        if (isMounted) {
          setRecommendation(data);
        }
      } catch (err: any) {
        console.error("Details fetch error:", err);
        if (isMounted) {
          setError(
            err.response?.data?.detail || 
            "Failed to retrieve recommendation details from server. Verify backend connection."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendation();
    return () => {
      isMounted = false;
    };
  }, [issueId, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="px-6 py-20 text-center space-y-4">
        <div className="h-10 w-10 mx-auto rounded-full bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta animate-spin">
          <HiMiniArrowPath className="text-xl" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-terracotta">
          Retrieving intelligence reports...
        </p>
      </div>
    );
  }

  if (error || !recommendation) {
    return (
      <div className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <ErrorState 
            title="Unable to Retrieve Details" 
            description={error || "Grievance ID not found."} 
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
      className="px-6 pb-12 pt-16 space-y-10"
    >
      {/* Language Chips */}
      <div className="flex justify-end gap-2 mb-4">
        {(["en", "hi", "te"] as const).map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              language === lang 
                ? "bg-brand-terracotta text-white shadow-md" 
                : "bg-brand-line/20 text-brand-ink hover:bg-brand-line/40"
            }`}
          >
            {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "తెలుగు"}
          </button>
        ))}
      </div>



      <div className="mx-auto max-w-none flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <SectionHeading
          eyebrow={t("Decision Intelligence Details", "Decision Intelligence Details")}
          title={recommendation?.action_brief?.title || `${recommendation?.category || "Infrastructure"} Recommendation`}
          description={`${t("Complaint ID", "Complaint ID")}: ${recommendation?.issue_id || "N/A"}`}
        />
        
        <div className="flex items-center gap-3 shrink-0">
          <Link to={`/action-brief?issue_id=${recommendation?.id}&lang=${language}`}>
            <Button size="lg" className="flex items-center gap-2 shadow-sm">
              <HiMiniDocumentText className="text-lg" /> {t("Generate Action Brief", "Generate Action Brief")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-none grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="space-y-3 bg-brand-terracotta/[0.02] border-brand-terracotta/20">
            <div className="flex items-center gap-2 text-brand-terracotta font-semibold text-xs tracking-wider uppercase">
              <HiMiniSparkles className="text-sm animate-pulse" />
              {t("Summary", "Summary")}
            </div>
            <p className="text-sm leading-6 text-brand-ink max-h-[12rem] overflow-y-auto pr-2 scrollbar-thin">
              {recommendation?.summary || "No summary available for this issue."}
            </p>
          </Card>

          {/* Recommendations Card */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-brand-ink font-semibold text-xs tracking-wider uppercase border-b border-brand-line/20 pb-3">
              <HiMiniListBullet className="text-brand-terracotta text-sm" />
              {t("Actionable Recommendations", "Actionable Recommendations")}
            </div>
            <ul className="space-y-3">
              {recommendation?.action_brief?.action_steps && recommendation.action_brief.action_steps.length > 0 ? (
                recommendation.action_brief.action_steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-brand-ink-light leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-terracotta/10 text-[10px] font-bold text-brand-terracotta mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <p className="text-xs text-brand-ink-light italic">No structured steps provided. Please refer to Action Brief.</p>
              )}
            </ul>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center gap-2 border-b border-brand-line/20 pb-3">
              <HiMiniBriefcase className="text-brand-terracotta text-lg" />
              <h4 className="text-lg font-bold text-brand-ink">{t("Metadata", "Execution Parameters")}</h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-line/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-light">
                  {t("Department", "Department")}
                </span>
                <Badge tone="accent">{recommendation?.action_brief?.assigned_department || "General Public Works"}</Badge>
              </div>
              
              <div className="flex items-center justify-between border-b border-brand-line/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-light">
                  {t("Estimated Budget", "Estimated Budget")}
                </span>
                <span className="text-sm font-bold text-brand-ink">
                  {recommendation?.action_brief?.budget_estimate || "TBD"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-brand-line/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-light">
                  {t("Timeline", "Timeline")}
                </span>
                <span className="text-sm font-bold text-brand-ink">
                  {recommendation?.timeline || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-brand-line/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-light">
                  {t("Severity", "Severity")}
                </span>
                <Badge tone={recommendation?.severity === "High" || recommendation?.severity === "Critical" ? "warning" : "default"}>
                  {recommendation?.severity || "Medium"}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-light">
                  {t("Category", "Category")}
                </span>
                <span className="text-sm font-semibold text-brand-ink truncate max-w-[150px]">
                  {recommendation?.category || "Infrastructure"}
                </span>
              </div>
            </div>
          </Card>

          {/* Location card */}
          {recommendation?.gps && (
            <Card className="p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light flex items-center gap-1.5">
                <HiMiniMapPin className="text-brand-terracotta" /> Location Pin
              </p>
              <p className="text-xs font-semibold text-brand-ink">
                Coordinates: <span className="font-mono bg-brand-line/20 px-2 py-1 rounded-md">{recommendation.gps}</span>
              </p>
              <p className="text-xs text-brand-ink-light leading-relaxed">
                Hotspot matches existing ward map grids. Highlighted priority is eligible for emergency PWD release funds.
              </p>
            </Card>
          )}

          <div className="text-center pt-2">
            <Link to="/mp-dashboard" className="text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:underline">
              ← Return to Executive Dashboard
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
