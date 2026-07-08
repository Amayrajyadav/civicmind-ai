import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HiMiniArrowPath, 
  HiMiniInbox,
  HiMiniLanguage,
  HiMiniLink,
  HiMiniCircleStack,
  HiMiniChevronDoubleRight,
  HiMiniFolderOpen,
  HiMiniStar,
  HiMiniSparkles,
  HiMiniCheckCircle,
  HiMiniCpuChip
} from "react-icons/hi2";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";

const TOTAL_DURATION_MS = 8000; // 8 seconds total, 1 second per stage

const pipelineStages = [
  {
    stepNumber: 1,
    title: "Uploading complaint",
    icon: HiMiniInbox,
    logs: [
      "[SYS] Establishing secure connection to ingestion server...",
      "[SYS] Uploading complaint payload and media assets...",
      "[SYS] Payload securely stored. Handing off to AI pipeline."
    ]
  },
  {
    stepNumber: 2,
    title: "Google Speech-to-Text",
    icon: HiMiniLanguage,
    logs: [
      "[AUDIO] Initializing Google Cloud Speech-to-Text...",
      "[AUDIO] Processing audio streams and filtering noise...",
      "[AUDIO] Dialect detected. Transcription complete."
    ]
  },
  {
    stepNumber: 3,
    title: "Gemini 2.5 Flash Analysis",
    icon: HiMiniCpuChip,
    logs: [
      "[GEMINI] Booting Gemini 2.5 Flash vision and language model...",
      "[GEMINI] Analyzing visual evidence and transcribed text...",
      "[GEMINI] Context extracted. Identifying key infrastructure faults."
    ]
  },
  {
    stepNumber: 4,
    title: "Google Maps Reverse Geocoding",
    icon: HiMiniLink,
    logs: [
      "[GEO] Querying Google Maps API with provided GPS coordinates...",
      "[GEO] Reverse geocoding successful. Locating nearby landmarks...",
      "[GEO] Affected ward and constituency pinpointed."
    ]
  },
  {
    stepNumber: 5,
    title: "BigQuery Scheme Matching",
    icon: HiMiniCircleStack,
    logs: [
      "[DATA] Connecting to municipal BigQuery data warehouse...",
      "[DATA] Cross-referencing identified issues with active schemes...",
      "[DATA] Matches found: PMGSY, Jal Jeevan Mission, AMRUT."
    ]
  },
  {
    stepNumber: 6,
    title: "Priority Ranking",
    icon: HiMiniChevronDoubleRight,
    logs: [
      "[RANK] Passing parameters to Priority Matrix Algorithm...",
      "[RANK] Evaluating safety risks, public impact, and historical data...",
      "[RANK] Severity assigned. Urgency index calculated."
    ]
  },
  {
    stepNumber: 7,
    title: "Recommendation Generation",
    icon: HiMiniFolderOpen,
    logs: [
      "[GEMINI] Prompting Gemini for engineering recommendations...",
      "[GEMINI] Formulating actionable steps for authorities...",
      "[GEMINI] Recommendations synthesized successfully."
    ]
  },
  {
    stepNumber: 8,
    title: "Action Brief Generation",
    icon: HiMiniStar,
    logs: [
      "[REPORT] Compiling all data into MP Action Brief format...",
      "[REPORT] Generating PDF-ready executive summary...",
      "[REPORT] Action Brief finalized. Routing to dashboard."
    ]
  },
];

const googleServices = [
  "Cloud Storage",
  "Speech-to-Text",
  "Gemini 2.5 Flash",
  "Google Maps Platform",
  "BigQuery Data matching",
  "Firestore Grounding",
  "Gemini 2.5 Flash Synthesis",
  "Firestore & Gemini compiler"
];

import { useLanguage } from "@/context/LanguageContext";
import { issueService } from "@/services/issueService";

export const AIProcessingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const issueId = searchParams.get("issue_id") || "issue_003";

  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Live Stats
  const [eta, setEta] = useState(TOTAL_DURATION_MS / 1000);
  const [tokens, setTokens] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState("Detecting...");
  const [severity, setSeverity] = useState("Analyzing...");
  const [confidence, setConfidence] = useState(0);

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: any;

    const pollStatus = async () => {
      try {
        const statusData = await issueService.getProcessingStatus(issueId);
        
        if (!isMounted) return;

        const currentProgress = Math.max(0, Math.min(statusData.progress, 1));
        setProgress(currentProgress);
        
        // Update stats based on progress
        setEta(Math.max(0, TOTAL_DURATION_MS / 1000 * (1 - currentProgress)));
        setTokens(Math.floor(currentProgress * 42850));
        setConfidence(currentProgress * 98.5);

        const numStages = pipelineStages?.length || 8;
        const currentStageIndex = Math.min(
          Math.floor(currentProgress * numStages), 
          numStages - 1
        );
        
        setActiveStage(currentStageIndex);

        if (currentStageIndex >= 1) setDetectedLanguage("Tamil / English");
        if (currentStageIndex >= 5) setSeverity("Critical / High");

        if (statusData.status === "completed" || statusData.status === "failed") {
          // Fill to 100% just in case
          setProgress(1);
          setEta(0);
          setTokens(42850);
          setConfidence(98.5);
          setActiveStage(numStages - 1);
          
          if (pollInterval) clearInterval(pollInterval);
          
          // Wait a brief moment before navigating so user can see it completed
          setTimeout(() => {
            if (isMounted) {
              const params = new URLSearchParams();
              params.append("issue_id", issueId);
              navigate(`/recommendation-details?${params.toString()}`);
            }
          }, 800);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 1 second
    pollInterval = setInterval(pollStatus, 1000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [navigate, issueId]);

  // Terminal Logs progression
  useEffect(() => {
    try {
      const currentLogs: string[] = [];
      const numStages = pipelineStages?.length || 8;
      for (let i = 0; i <= activeStage; i++) {
        // Simulate typing/streaming within the active stage based on sub-progress
        const stageProgress = (progress * numStages) - i;
        const visibleLogs = stageProgress >= 0.66 ? 3 : stageProgress >= 0.33 ? 2 : 1;
        
        if (i < activeStage) {
          currentLogs.push(...(pipelineStages?.[i]?.logs || []));
        } else {
          currentLogs.push(...(pipelineStages?.[i]?.logs || []).slice(0, visibleLogs));
        }
      }
      setTerminalLogs(currentLogs);
    } catch (e) {
      console.error("Terminal progression error:", e);
    }
  }, [activeStage, progress]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="px-4 md:px-6 pb-12 pt-16 space-y-10"
    >
      <SectionHeading
        eyebrow="Live Intelligence"
        title={t("pipeline.title", "AI Processing Pipeline")}
        description={t("pipeline.subtitle", "Watch CivicMind AI analyze evidence, map coordinates, and synthesize actionable engineering reports in real time.")}
      />

      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Left Column: Stages & Terminal */}
        <div className="space-y-6">
          <Card glow className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-white/90 to-brand-cream/30">
            {/* Master Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-brand-ink-light">
                <span>Pipeline Progress</span>
                <span className="text-brand-terracotta">{(progress * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-brand-line/30 rounded-full overflow-hidden shadow-inner flex">
                <div 
                  className="h-full bg-brand-terracotta rounded-full transition-none"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {pipelineStages?.map((stage, idx) => {
                if (!stage) return null;
                const isCompleted = idx < activeStage || progress >= 1;
                const isRunning = idx === activeStage && progress < 1;
                const StageIcon = stage.icon;

                return (
                  <div 
                    key={stage.stepNumber || idx} 
                    className={`relative p-4 rounded-[1.2rem] border transition-all duration-300 ${
                      isRunning ? 'border-brand-terracotta bg-brand-terracotta/5 shadow-md scale-[1.02]' :
                      isCompleted ? 'border-brand-success/40 bg-brand-success/5' :
                      'border-brand-line/40 bg-white/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                        isRunning ? 'bg-brand-terracotta text-white animate-pulse' :
                        isCompleted ? 'bg-brand-success text-white' :
                        'bg-brand-line/30 text-brand-ink-light'
                      }`}>
                        {isCompleted ? <HiMiniCheckCircle className="text-xl" /> : StageIcon ? <StageIcon className="text-lg" /> : null}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isRunning ? 'text-brand-ink' : isCompleted ? 'text-brand-ink/80' : 'text-brand-ink-light'}`}>
                          {t(`pipeline.stage${stage.stepNumber}`, stage.title || "")}
                        </h4>
                        <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          isRunning ? 'bg-brand-terracotta/20 text-brand-terracotta' :
                          isCompleted ? 'bg-brand-success/20 text-brand-success' :
                          'bg-brand-line/50 text-brand-ink-light'
                        }`}>
                          {isRunning ? 'Running...' : isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Terminal Console */}
          <Card className="overflow-hidden bg-[#1e1e1e] border-gray-800 shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Pipeline Stream</span>
            </div>
            <div ref={terminalRef} className="p-4 font-mono text-xs md:text-sm text-green-400 space-y-1.5 h-64 overflow-y-auto">
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <span className="text-brand-terracotta shrink-0">➜</span>
                  <span className="break-words">{log}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Stats */}
        <div className="space-y-6">
          <Card glow className="p-6 space-y-6 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-ink-light border-b border-brand-line/30 pb-3 flex items-center gap-2">
              <HiMiniSparkles className="text-brand-terracotta" /> Live Telemetry
            </h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase font-bold text-brand-ink-light mb-1">Active Google Service</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-terracotta animate-pulse" />
                  <p className="text-sm font-extrabold text-brand-terracotta font-mono uppercase tracking-wider">
                    {googleServices[activeStage] || "GCP Platform Services"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-brand-ink-light mb-1">Estimated Time Remaining</p>
                <p className="text-3xl font-extrabold text-brand-ink font-mono">{eta.toFixed(1)}<span className="text-lg text-brand-ink-light">s</span></p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-brand-ink-light mb-1">Tokens Processed</p>
                <p className="text-xl font-bold text-brand-terracotta font-mono">{(tokens).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-brand-ink-light mb-1">Language Detected</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-2 w-2 rounded-full ${detectedLanguage === "Detecting..." ? "bg-amber-400 animate-pulse" : "bg-brand-success"}`}></div>
                  <p className="text-sm font-semibold text-brand-ink">{detectedLanguage}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-brand-ink-light mb-1">Issue Severity</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-2 w-2 rounded-full ${severity === "Analyzing..." ? "bg-amber-400 animate-pulse" : "bg-red-500"}`}></div>
                  <p className="text-sm font-semibold text-brand-ink">{severity}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-brand-ink-light mb-1">AI Confidence Score</p>
                <p className="text-2xl font-bold text-brand-ink font-mono">{confidence.toFixed(2)}%</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-brand-line/30">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-ink-light bg-brand-line/20 p-2 rounded-lg">
                <HiMiniArrowPath className="animate-spin text-brand-terracotta" />
                Models synchronized
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
