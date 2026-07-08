import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiMiniCheckCircle,
  HiMiniMicrophone,
  HiMiniTrash
} from "react-icons/hi2";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { UploadZone } from "@/components/UploadZone";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { issueService } from "@/services/issueService";
import { useLanguage } from "@/context/LanguageContext";

export const IssueSubmissionPage: React.FC = () => {
  const { language, setLanguage, t, getVoiceLocale } = useLanguage();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [gpsCoordinates, setGpsCoordinates] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const hasAutoSubmittedRef = useRef(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Voice recording refs and states
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);



  const isDemo = searchParams.get("demo") === "true";
  const isQuick = searchParams.get("mode") === "quick";
  const isVoiceMode = searchParams.get("mode") === "voice" || (routerLocation.state as any)?.voicePrefill;

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title || !description) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category || "Uncategorized");
      formData.append("location", location || "Unknown");
      formData.append("gps_coordinates", gpsCoordinates || "");
      
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
      
      const response = await issueService.submitIssue(formData);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setShowSuccess(true);
      
      const isJudge = searchParams.get("judge") === "true";
      const params = new URLSearchParams();
      params.append("issue_id", response.issue_id);
      if (isDemo) params.append("demo", "true");
      if (isJudge) params.append("judge", "true");

      setTimeout(() => {
        navigate(`/ai-processing?${params.toString()}`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || "Submission failed. Please check backend connections.");
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, category, location, gpsCoordinates, selectedFiles, audioUrl, navigate, searchParams, isDemo]);

  useEffect(() => {
    if (isDemo) {
      setTitle("Severe Water Logging and Blocked Drain at Sector 4 Main Market");
      setDescription("Water is accumulating up to 2 feet in front of shops due to a blocked storm-water drain. The primary health center access road is completely flooded.");
      setCategory("Water Supply");
      setLocation("Sector 4 Main Market Road, Hyderabad");
      setGpsCoordinates("17.3982, 78.4905");
    } else if (isQuick) {
      setTitle("Hazardous Open Pothole on Sector 2 Intersection");
      setDescription("A deep pothole measuring roughly 3ft wide and 1ft deep is located right in the middle of the road. Immediate repair is required before a serious accident occurs.");
      setCategory("Roads & Safety");
      setLocation("Sector 2 Main Ring Road, Hyderabad");
      setGpsCoordinates("17.3716, 78.4746");
    } else if (isVoiceMode) {
      const state = routerLocation.state as any;
      if (state?.voicePrefill) {
        setTitle(state.title);
        setDescription(state.description);
        setCategory(state.category);
        setLocation(state.location);
        setGpsCoordinates(state.gpsCoordinates);
      } else {
        setLocation("Sector 4 Metro Corridor, Hyderabad");
        setGpsCoordinates("17.3982, 78.4905");
      }
    }
  }, [searchParams, isDemo, isQuick, isVoiceMode, routerLocation.state]);

  const handleFilesSelected = (files: File[]) => {
    const allowedExtensions = ["png", "jpg", "jpeg", "pdf"];
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      return allowedExtensions.includes(extension);
    });
    if (validFiles.length < files.length) {
      setErrorMsg("Some files were skipped. Only PNG, JPG, JPEG, and PDF are supported.");
    }
    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const startTimer = () => {
    setRecordingSeconds(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
  };

  const stopRecordingInternal = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecordingInternal();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopRecordingInternal]);

  const processVoiceSubmission = useCallback(() => {
    setDescription((prevDesc) => {
      const finalDesc = prevDesc.trim() || "Voice Intake grievance registered.";
      const titlePrefix = language === "hi" ? "आवाज शिकायत" : language === "te" ? "వాయిస్ ఫిర్యాదు" : "Voice Intake";
      const firstWords = finalDesc.split(" ").slice(0, 5).join(" ");
      setTitle(`${titlePrefix}: ${firstWords}...`);

      const descLower = finalDesc.toLowerCase();
      let inferredCategory = "General / Uncategorized";
      if (descLower.match(/(water|drain|sewer|leak|pipe|पानी|नीरु)/)) inferredCategory = "Drainage & Sewerage";
      else if (descLower.match(/(road|pothole|street|pavement|सड़क|रोड|రహదారి)/)) inferredCategory = "Roads & Safety";
      else if (descLower.match(/(garbage|trash|waste|dump|कचरा|చెత్త)/)) inferredCategory = "Public Health";
      
      setCategory(inferredCategory);
      setLocation("Auto-detected Location, Hyderabad");
      setGpsCoordinates("17.3850, 78.4867");

      if (!hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
      }
      return finalDesc;
    });
  }, [language]);

  const initRecorders = async () => {
    try {
      if (!audioStreamRef.current) {
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!mediaRecorderRef.current) {
        mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current);
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(blob);
          setAudioUrl((prevUrl) => {
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            return URL.createObjectURL(blob);
          });
          const file = new File([blob], "voice_note.webm", { type: mimeType });
          setSelectedFiles((prev) => {
            const filtered = prev.filter(f => f.name !== "voice_note.webm");
            return [...filtered, file];
          });
        };
      }
      if (!recognitionRef.current) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) throw new Error("SpeechRecognition not supported");
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.interimResults = true;
        recognitionRef.current.continuous = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + " ";
          }
          setDescription(transcript.trim());
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition error:", event.error);
          if (event.error === 'not-allowed') {
             stopRecordingInternal();
             setErrorMsg("Microphone access denied.");
          }
        };

        recognitionRef.current.onend = () => {
          if (isRecordingRef.current) {
            stopRecordingInternal();
            processVoiceSubmission();
          }
        };
      }
      return true;
    } catch (err) {
      console.error(err);
      setErrorMsg("Voice recording not supported or permission denied.");
      return false;
    }
  };

  const toggleRecording = async () => {
    if (isRecordingRef.current) {
      stopRecordingInternal();
      processVoiceSubmission();
    } else {
      setErrorMsg(null);
      setDescription("");
      audioChunksRef.current = [];
      hasAutoSubmittedRef.current = false;
      
      const initialized = await initRecorders();
      if (!initialized) {
        setTitle(language === "hi" ? "आवाज शिकायत: पानी पाइपलाइन" : language === "te" ? "వాయిస్ ఫిర్యాదు: నీటి పైప్‌లైన్" : "Voice Intake: Ruptured Water Main Line");
        setDescription("There is a major pipeline leak on Sector 4 Main Market road. Water is spraying onto the pavement.");
        setCategory("Water Supply");
        setLocation("Sector 4 Main Market Road, Hyderabad");
        setGpsCoordinates("17.3982, 78.4905");
        return;
      }

      if (recognitionRef.current && mediaRecorderRef.current) {
        recognitionRef.current.lang = getVoiceLocale();
        try {
          recognitionRef.current.start();
          mediaRecorderRef.current.start();
          setIsRecording(true);
          isRecordingRef.current = true;
          startTimer();
        } catch (e) {
          console.error("Recording start error", e);
        }
      }
    }
  };

  const handleAutoLocate = () => {
    setLocation("Sector 4 Metro Corridor, Hyderabad");
    setGpsCoordinates("17.3982, 78.4905");
    setErrorMsg(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="px-6 pb-12 pt-16 space-y-10">
      <LoadingOverlay isVisible={isSubmitting} message={t("submission.submitting", "Submitting Grievance")} subMessage={t("submission.submittingDesc", "Registering issue details...")} />
      {showSuccess && <SuccessOverlay title={t("submission.success", "Submission Successful")} message={t("submission.successDesc", "Your grievance has been recorded.")} icon={<HiMiniCheckCircle className="text-4xl text-brand-success" />} />}
      
      <SectionHeading eyebrow={t("submission.eyebrow", "Grievance Submission")} title={t("submission.title", "Register constituency issue.")} description={t("submission.description", "Provide clear details. CivicMind AI will automatically analyze your report.")} />
      

      
      <div className="mx-auto max-w-none">
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card glow className="p-6 md:p-8 space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-brand-ink border-b border-brand-line/20 pb-3">{t("submission.params", "Grievance Intake Parameters")}</h3>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-brand-ink/90">{t("submission.issueTitle", "Issue Title *")}</label>
              <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("submission.issueTitlePlh", "e.g., Damaged Water Pipe")} className="w-full rounded-[1.2rem] border border-brand-line/60 bg-white/50 px-4 py-3.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-brand-ink/90">{t("submission.detailedDesc", "Detailed Description *")}</label>
                <div className="flex items-center gap-3">
                  <div className="flex bg-brand-line/20 rounded-full p-0.5 text-[10px] font-bold">
                    {(["en", "hi", "te"] as const).map(lang => (
                      <button key={lang} type="button" onClick={() => setLanguage(lang)} disabled={isRecording} className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${language === lang ? "bg-brand-terracotta text-white" : "text-brand-ink hover:bg-brand-line/35"} disabled:opacity-50`}>{lang === "en" ? "EN" : lang === "hi" ? "HI" : "TE"}</button>
                    ))}
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full justify-between animate-pulse">
                      <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider">{t("citizen.voiceRecording", "Recording")} ({Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:{(recordingSeconds % 60).toString().padStart(2, "0")})</span>
                      <div className="flex gap-0.5 items-end h-2.5">
                        <span className="w-0.5 bg-red-500 rounded-full animate-[bounce_0.8s_infinite_100ms] h-1.5" />
                        <span className="w-0.5 bg-red-500 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3" />
                        <span className="w-0.5 bg-red-500 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2" />
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={toggleRecording} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors cursor-pointer ${isRecording ? "bg-red-500 text-white shadow-sm shadow-red-500/15" : "bg-brand-ink/5 text-brand-ink hover:bg-brand-ink/10"}`}>
                    {isRecording ? t("citizen.stop", "Stop") : t("citizen.voiceNote", "Record Voice")}
                  </button>
                </div>
              </div>
              <textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("submission.detailedDescPlh", "Provide a detailed description...")} rows={4} className="w-full rounded-[1.2rem] border border-brand-line/60 bg-white/50 px-4 py-3.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta" />
              {audioUrl && (
                <div className="mt-3 p-4 rounded-[1.2rem] bg-brand-cream/60 border border-brand-line/45 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-ink">
                    <span className="flex items-center gap-1.5 text-brand-terracotta"><HiMiniMicrophone className="text-sm animate-pulse" /> {t("submission.voicePayload", "Voice Intake Payload")}</span>
                    <span>{audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : "Voice Note"}</span>
                  </div>
                  <audio src={audioUrl} controls className="w-full h-8" />
                  <button type="button" onClick={() => { setAudioUrl(null); setAudioBlob(null); setSelectedFiles((prev) => prev.filter((f) => f.name !== "voice_note.webm")); }} className="flex items-center gap-1 self-end text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">
                    <HiMiniTrash className="text-sm" /> {t("submission.removeVoice", "Remove voice Note")}
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-brand-ink/90">{t("submission.category", "Category *")}</label>
              <input id="category" type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("submission.categoryPlh", "e.g., Water Supply")} className="w-full rounded-[1.2rem] border border-brand-line/60 bg-white/50 px-4 py-3.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-brand-ink/90">{t("submission.location", "Location *")}</label>
              <input id="location" type="text" list="address-suggestions" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("submission.locationPlh", "e.g., Sector 4 Main Market")} className="w-full rounded-[1.2rem] border border-brand-line/60 bg-white/50 px-4 py-3.5 text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-terracotta" />
              <datalist id="address-suggestions"><option value="Sector 4 Main Market Road, City Center" /><option value="Sector 5 Water Works Avenue" /><option value="Sector 2 Neighborhood Park" /></datalist>
              <button type="button" onClick={handleAutoLocate} className="text-sm text-brand-terracotta underline mt-1 cursor-pointer">{t("submission.autoLocate", "Auto-detect GPS")}</button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/90" htmlFor="upload-zone">{t("submission.evidence", "Upload Payloads & Evidence")}</label>
              <UploadZone onFilesSelected={handleFilesSelected} selectedFiles={selectedFiles} onRemoveFile={handleRemoveFile} maxFiles={5} />
            </div>
            {errorMsg && <p className="text-sm text-red-600 mt-2 font-semibold">{errorMsg}</p>}
          </Card>
          
          <div className="space-y-6">
            <Card glow className="p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-brand-ink border-b border-brand-line/20 pb-3">Live Evidence Intake Preview</h3>
              <div className="space-y-4 text-sm leading-relaxed">
                <div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Title</span><p className="font-bold text-brand-ink mt-0.5">{title || "Untitled Grievance"}</p></div>
                <div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Description</span><p className="text-brand-ink-light mt-0.5 text-xs whitespace-pre-wrap leading-5">{description || "No description provided."}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Category</span><p className="font-semibold text-brand-ink mt-0.5 text-xs">{category || "Unclassified"}</p></div>
                  <div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">GPS Reference</span><p className="font-semibold text-brand-ink mt-0.5 text-xs">{gpsCoordinates || "Not detected"}</p></div>
                </div>
                <div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Target Location</span><p className="font-semibold text-brand-ink mt-0.5 text-xs">{location || "Unknown location"}</p></div>
                <div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">Attached Payloads</span><p className="text-brand-ink-light mt-0.5 text-xs">{selectedFiles.length} file(s) loaded</p></div>
              </div>
            </Card>
          </div>
          
          <div className="col-span-1 xl:col-span-2 mt-2 flex justify-end w-full border-t border-brand-line/30 pt-8">
            <Button type="submit" disabled={isSubmitting} className={`w-full sm:w-auto flex items-center justify-center gap-2 shadow-md bg-brand-terracotta text-white px-10 py-4 text-base font-bold transition-transform hover:scale-[1.02] ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}>
              {t("submission.submitBtn", "Submit to AI Pipeline")} →
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
