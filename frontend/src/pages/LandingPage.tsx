import React from "react";
import { Link } from "react-router-dom";
import { MotionLayout } from "@/components/MotionLayout";
import { 
  HiMiniSparkles, 
  HiMiniArrowUpRight, 
  HiMiniChatBubbleLeftRight, 
  HiMiniMapPin, 
  HiMiniBolt, 
  HiMiniDocumentCheck,
  HiMiniScale
} from "react-icons/hi2";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MetricCard } from "@/components/MetricCard";
import { SectionHeading } from "@/components/SectionHeading";
import { TimelineStep } from "@/components/TimelineStep";

export const LandingPage: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: "Citizen Intake",
      description: "Grievances are captured via natural voice inputs, location pins, and photographs in local dialects.",
      icon: HiMiniChatBubbleLeftRight,
      status: "completed" as const
    },
    {
      step: 2,
      title: "Multimodal AI Extraction",
      description: "Google Gemini normalizes language, auto-detects civic categories, and estimates population impact.",
      icon: HiMiniSparkles,
      status: "completed" as const
    },
    {
      step: 3,
      title: "Evidence Layers & Schemes",
      description: "Overlaying historical flood risk, health accessibility maps, and matching eligible public funding programs.",
      icon: HiMiniMapPin,
      status: "completed" as const
    },
    {
      step: 4,
      title: "Actionable MP Recommendations",
      description: "Synthesizing transparent priority scores and formatting official Member of Parliament action briefs.",
      icon: HiMiniBolt,
      status: "completed" as const
    }
  ];

  return (
    <MotionLayout className="space-y-24 pb-12 pt-8">
      {/* Hero Section */}
      <section className="relative px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,163,115,0.12),_transparent_55%)] -z-10 blur-2xl" />
        <div className="mx-auto max-w-[1100px] text-center space-y-10">
          
          {/* Flow Map Diagram (10-Second Visual Guide) */}
          <div className="mx-auto max-w-4xl rounded-full bg-brand-sand/5 border border-brand-line/40 p-2 text-[10px] text-brand-ink-light/90 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 shadow-sm sm:text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-brand-line/30 shadow-xs font-semibold text-brand-ink">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-terracotta text-white text-[9px] font-bold">1</span>
              Citizen Complaint
            </div>
            <span className="text-brand-line/70 hidden sm:inline">→</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 rounded-full border border-brand-line/20 font-semibold text-brand-ink-light">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-sand text-brand-ink-light text-[9px] font-bold">2</span>
              AI Analysis
            </div>
            <span className="text-brand-line/70 hidden sm:inline">→</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 rounded-full border border-brand-line/20 font-semibold text-brand-ink-light">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-sand text-brand-ink-light text-[9px] font-bold">3</span>
              Government Recommendation
            </div>
            <span className="text-brand-line/70 hidden sm:inline">→</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 rounded-full border border-brand-line/20 font-semibold text-brand-ink-light">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-sand text-brand-ink-light text-[9px] font-bold">4</span>
              Action Brief
            </div>
          </div>


          <h1 className="text-balance text-5xl font-extrabold tracking-tight text-brand-ink md:text-7xl leading-[1.05]">
            Turn citizen voices into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-terracotta to-brand-sand">
              explainable civic priorities
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base text-brand-ink-light md:text-lg leading-relaxed">
            CivicMind AI bridges the gap between community grievances and political execution. We ingest citizen reports, run decision scoring grounded in public data, and generate MP-ready briefs.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row pt-2">
            <Link to="/issue-submission?demo=true">
              <Button size="lg" className="w-full sm:w-auto shadow-md bg-brand-terracotta text-white flex items-center justify-center gap-1.5">
                <HiMiniSparkles className="animate-pulse text-sm" /> Quick Walkthrough
              </Button>
            </Link>
            <Link to="/citizen-portal?demo=true&judge=true">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Guided Tour
              </Button>
            </Link>
            <Link to="/citizen-portal">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Citizen Portal
              </Button>
            </Link>
            <Link to="/mp-dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                Executive Dashboard
                <HiMiniArrowUpRight className="ml-1.5 text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="px-6">
        <div className="mx-auto max-w-none">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Citizen Signals"
              value="280,000"
              suffix="+"
              note="Aggregated from ward reports, municipal logs, and local submissions."
            />
            <MetricCard
              label="AI Priority Confidence"
              value="96"
              suffix="%"
              note="Recommendations fully explainable across need, feasibility, and budget fits."
            />
            <MetricCard
              label="Active Hotspots"
              value="42"
              note="Semantic issue groups continuously clustered in real time."
            />
            <MetricCard
              label="Review Hours Saved"
              value="18"
              suffix=" hrs"
              note="Saved weekly for planning teams transitioning complaints to execution."
            />
          </div>
        </div>
      </section>

      {/* 4 Core Pillars section (Replaces Problem Statement & Grounding Datasets) */}
      <section className="px-6">
        <div className="mx-auto max-w-[1100px] space-y-10">
          <SectionHeading
            eyebrow="Core Framework"
            title="Decision intelligence designed for community action."
            description="How CivicMind AI resolves complaints, automates policy-level scheme fits, and drives local alignment."
          />
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col justify-between p-6 bg-white/70">
              <div className="space-y-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 text-lg">
                  <HiMiniScale />
                </span>
                <h4 className="text-base font-bold text-brand-ink">The Problem</h4>
                <p className="text-xs leading-5 text-brand-ink-light">
                  Constituency input channels are fragmented. Urgent community issues are buried under noise, leaving capital budgets allocated without transparent scores.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between p-6 bg-white/70">
              <div className="space-y-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-terracotta/10 text-brand-terracotta text-lg">
                  <HiMiniSparkles />
                </span>
                <h4 className="text-base font-bold text-brand-ink">Why AI is Needed</h4>
                <p className="text-xs leading-5 text-brand-ink-light">
                  Gemini models translate voice dialects, identify duplicate signals, and cross-reference welfare schemes to remove sorting blockages.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between p-6 bg-white/70">
              <div className="space-y-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-success/15 text-brand-success text-lg">
                  <HiMiniChatBubbleLeftRight />
                </span>
                <h4 className="text-base font-bold text-brand-ink">Citizen Benefit</h4>
                <p className="text-xs leading-5 text-brand-ink-light">
                  Submit localized grievances in natural voice, upload photos directly, and watch live pipeline status updates with complete transparency.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between p-6 bg-white/70">
              <div className="space-y-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sand/15 text-brand-sand text-lg">
                  <HiMiniDocumentCheck />
                </span>
                <h4 className="text-base font-bold text-brand-ink">MP Benefit</h4>
                <p className="text-xs leading-5 text-brand-ink-light">
                  Receive strategy-grade priority scores, estimated budgets, and matched government welfare funding recommendations in official briefs.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Pipeline Flow */}
      <section className="px-6">
        <div className="mx-auto max-w-[1100px] space-y-10">
          <SectionHeading
            eyebrow="The AI Workflow"
            title="A clear, explainable pathway from signal to priority."
            description="How CivicMind AI transforms raw citizen evidence into verified operational roadmaps."
          />
          
          <div className="grid gap-4">
            {steps.map((item) => (
              <TimelineStep
                key={item.step}
                stepNumber={item.step}
                title={item.title}
                description={item.description}
                icon={item.icon}
                status={item.status}
                progressThreshold={1.0}
              />
            ))}
          </div>
        </div>
      </section>
    </MotionLayout>
  );
};


