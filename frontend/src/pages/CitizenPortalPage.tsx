import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HiMiniPhoto, 
  HiMiniMicrophone, 
  HiMiniPaperAirplane, 
  HiMiniGlobeAlt
} from "react-icons/hi2";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { SectionHeading } from "@/components/SectionHeading";
import { dashboardService, type DashboardIssueBrief } from "@/services/dashboardService";
import { issueService } from "@/services/issueService";

import { useLanguage } from "@/context/LanguageContext";

const categories = ["Roads & Safety", "Drainage & Sewerage", "Water Supply", "Street Lighting", "Health & Hygiene"];



export const CitizenPortalPage: React.FC = () => {
  const { language, setLanguage, t, getVoiceLocale } = useLanguage();
  const [recentIssues, setRecentIssues] = useState<DashboardIssueBrief[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();



  // Quick Submit Modal State
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickCategory, setQuickCategory] = useState("Roads & Safety");
  const [quickSeverity, setQuickSeverity] = useState("High");
  const [quickLocation, setQuickLocation] = useState("");
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerIntervalRef = React.useRef<any>(null);

  // Removed Demo auto-navigate hook

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    const fetchRecentIssues = async () => {
      setLoading(true);
      try {
        const stats = await dashboardService.getDashboard();
        if (isMounted) {
          setRecentIssues(stats.recent_issues || []);
        }
      } catch (err) {
        console.error("Failed to load portal recent signals:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchRecentIssues();
    return () => {
      isMounted = false;
    };
  }, []);

  const startTimer = () => {
    setRecordingSeconds(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const recognitionRef = React.useRef<any>(null);

  const initRecognition = () => {
    if (recognitionRef.current) return true;
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) throw new Error("SpeechRecognition API not supported.");
      
      const recognition = new SpeechRecognition();
      recognition.interimResults = false;
      recognition.continuous = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        navigate("/issue-submission", {
          state: {
            voicePrefill: true,
            title: "Voice Intake Grievance",
            description: transcript,
            category: "General / Uncategorized",
            location: "Location inferred from metadata, Hyderabad",
            gpsCoordinates: "17.3982, 78.4905"
          }
        });
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        stopTimer();
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        stopTimer();
      };
      
      recognitionRef.current = recognition;
      return true;
    } catch (err) {
      console.error("Voice recording not supported", err);
      return false;
    }
  };

  const toggleRecording = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopTimer();
      setIsRecording(false);
    } else {
      if (initRecognition()) {
        recognitionRef.current.lang = getVoiceLocale();
        recognitionRef.current.start();
        setIsRecording(true);
        startTimer();
      } else {
        const simulatedText = "There is a major pipeline leak on Sector 4 Main Market road. Water is spraying onto the pavement, creating a huge slippery hazard for commuters.";
        navigate("/issue-submission", {
          state: {
            voicePrefill: true,
            title: "Voice Intake: Ruptured Water Main Line",
            description: simulatedText,
            category: "Water Supply",
            location: "Sector 4 Main Market Road, Hyderabad",
            gpsCoordinates: "17.3982, 78.4905"
          }
        });
      }
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuickSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", `Emergency Issue: ${quickCategory}`);
      formData.append("description", `Urgent ${quickSeverity.toLowerCase()} severity issue reported for immediate attention in ${quickCategory}. User location automatically verified.`);
      formData.append("category", quickCategory);
      formData.append("location", quickLocation || "Hyderabad");
      formData.append("gpsCoordinates", "17.3716, 78.4746");
      
      const response = await issueService.submitIssue(formData);
      setIsQuickSubmitting(false);
      setShowQuickModal(false);
      navigate(`/ai-processing?issue_id=${response.issue_id}`);
    } catch (err) {
      console.error(err);
      setIsQuickSubmitting(false);
    }
  };

  const displayIssues = recentIssues;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="px-6 pb-12 pt-16 space-y-10"
    >

      <SectionHeading
        eyebrow={t("citizen.eyebrow", "Citizen Portal")}
        title={t("citizen.title", "Warm, accessible civic reporting.")}
        description={t("citizen.description", "Share what needs attention in your neighborhood. Designed for voice-first speed, simple document attachment, and direct transparency.")}
      />

      <div className="mx-auto max-w-none grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left Side: Submit Actions */}
        <Card glow className="p-6 md:p-8 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              {t("citizen.submitReport", "Submit a development report")}
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink">
              {t("citizen.chooseMode", "Choose your preferred input mode")}
            </h3>
          </div>

          {/* Media Card Upload zone link */}
          <Link to="/issue-submission" className="block">
            <div className="rounded-[2rem] border border-dashed border-brand-terracotta/30 bg-gradient-to-b from-white/90 to-brand-cream/40 p-8 text-center hover:bg-brand-cream/60 transition-all duration-300">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-terracotta/10 text-2xl text-brand-terracotta shadow-sm">
                <HiMiniPhoto />
              </div>
              <p className="mt-4 text-base font-bold text-brand-ink">{t("citizen.uploadMedia", "Upload Site Media")}</p>
              <p className="mt-2 text-xs text-brand-ink-light leading-relaxed">
                {t("citizen.uploadDesc", "Take a photo or attach files of potholes, damaged water pipes, or uncleared waste dumps to verify location.")}
              </p>
              <Button variant="secondary" size="sm" className="mt-5">
                {t("citizen.uploadBtn", "Upload Media Evidence")}
              </Button>
            </div>
          </Link>

          {/* Alternative Buttons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center justify-between rounded-[1.7rem] border border-brand-line/50 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 text-left cursor-pointer ${isRecording ? "bg-red-500/10 border-red-500/20" : "bg-white/70"}`}
            >
              <div>
                <p className="font-bold text-brand-ink">
                  {isRecording ? t("citizen.stop", "Stop") : t("citizen.voiceNote", "Voice Note")}
                </p>
                <p className="text-xs text-brand-ink-light mt-0.5">
                  {isRecording 
                    ? `${t("citizen.voiceRecording", "Recording")}: ${Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:${(recordingSeconds % 60).toString().padStart(2, '0')} ...` 
                    : t("citizen.voiceDesc", "Record in your own dialect")
                  }
                </p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${isRecording ? "bg-red-500 text-white animate-pulse shadow-md" : "bg-brand-success/10 text-brand-success"}`}>
                <HiMiniMicrophone />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuickModal(true)}
              className="flex items-center justify-between rounded-[1.7rem] border border-brand-line/50 bg-white/70 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-brand-ink">{t("citizen.quickSubmit", "Quick Submit")}</p>
                <p className="text-xs text-brand-ink-light mt-0.5">{t("citizen.quickDesc", "For urgent local safety issues")}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-terracotta/15 text-brand-terracotta text-xl">
                <HiMiniPaperAirplane />
              </span>
            </button>
          </div>
        </Card>

        {/* Right Side: Info Panel & Signals */}
        <div className="space-y-6">
          {/* Recent signals card */}
          <Card className="p-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              {t("citizen.recentSignals", "Recent Constituency Signals")}
            </p>
            
            {loading ? (
              <div className="py-8 text-center text-xs text-brand-ink-light animate-pulse">
                {t("citizen.recentDesc", "Syncing live feeds...")}
              </div>
            ) : (
              <div className="space-y-3">
                {displayIssues.slice(0, 4).map((issue) => (
                  <div key={issue.id} className="rounded-[1.35rem] border border-brand-line/40 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-brand-ink leading-relaxed line-clamp-2 max-w-[14rem]">
                        {issue.title}
                      </p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        issue.status === "completed" 
                          ? "bg-brand-success/10 text-brand-success" 
                          : issue.status === "processing" 
                          ? "bg-amber-500/10 text-amber-600" 
                          : "bg-brand-line/30 text-brand-ink-light"
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-brand-ink-light/80">
                      {issue.category} {issue.created_at && `| ${new Date(issue.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Config card */}
          <Card className="p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light flex items-center gap-1.5">
                <HiMiniGlobeAlt className="text-brand-terracotta" /> Languages Supported
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["en", "hi", "te"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      (lang === "en" && language === "en") || 
                      (lang === "hi" && language === "hi") || 
                      (lang === "te" && language === "te")
                        ? "bg-brand-terracotta text-white shadow-sm"
                        : "bg-brand-line/20 text-brand-ink hover:bg-brand-line/40"
                    }`}
                  >
                    {lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Telugu"}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-line/20 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">
                Grievance Scopes
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Badge key={cat} tone="default" className="px-2.5 py-1 text-[10px]">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Submit Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/50 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center border-b border-brand-line/30 pb-3">
              <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                <HiMiniPaperAirplane className="text-brand-terracotta" />
                Emergency Quick Submit
              </h3>
              <button type="button" onClick={() => setShowQuickModal(false)} className="text-brand-ink-light hover:text-brand-ink">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Category</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full rounded-[1rem] border border-brand-line/60 bg-white px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Severity</label>
                <select
                  value={quickSeverity}
                  onChange={(e) => setQuickSeverity(e.target.value)}
                  className="w-full rounded-[1rem] border border-brand-line/60 bg-white px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Location</label>
                <div className="flex gap-2">
                  <input
                    required
                    value={quickLocation}
                    onChange={(e) => setQuickLocation(e.target.value)}
                    placeholder="Enter location"
                    className="flex-1 rounded-[1rem] border border-brand-line/60 bg-white px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                  <button type="button" onClick={() => setQuickLocation("Auto-detected via GPS")} className="px-3 rounded-[1rem] bg-brand-terracotta/10 text-brand-terracotta text-xs font-bold shrink-0">
                    Auto Detect
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" disabled={isQuickSubmitting} className="w-full flex justify-center gap-2">
                  {isQuickSubmitting ? "Submitting..." : "Submit to AI Pipeline →"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
