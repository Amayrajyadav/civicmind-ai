import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { 
  HiMiniArrowPath, 
  HiMiniFolderOpen,
  HiMiniInformationCircle
} from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { MetricCard } from "@/components/MetricCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { MapCard } from "@/components/MapCard";
import { ErrorState } from "@/components/ErrorState";
import { dashboardService, type DashboardStatsResponse } from "@/services/dashboardService";

// Helper function to map GPS locations deterministically based on string hash
const getHashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

import { useLanguage } from "@/context/LanguageContext";

export const MPDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  const newIssueId = searchParams.get("new_issue_id") || "";

  // Removed Demo auto-navigate hook

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getDashboard();
        if (isMounted) {
          setStats(data);
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        if (isMounted) {
          setError(
            err.response?.data?.detail || 
            "Failed to synchronize with constituency analytics server. Check backend connections."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

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
          Syncing Constituency Command Center...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <ErrorState 
            title="Dashboard Sync Offline" 
            description={error || undefined} 
            onRetry={handleRetry} 
          />
        </div>
      </div>
    );
  }

  // Map backend category distribution to chart array format
  const chartData = Object.entries(stats.category_distribution || {}).map(([key, val]) => ({
    name: key,
    Grievances: val,
  }));

  // Fixed coordinates for Hyderabad (No random offsets)
  const fixedCoordinates = [
    { lat: 17.3850, lng: 78.4867 },
    { lat: 17.3910, lng: 78.4720 },
    { lat: 17.3734, lng: 78.4900 },
    { lat: 17.4000, lng: 78.4500 },
    { lat: 17.3820, lng: 78.5020 },
    { lat: 17.3950, lng: 78.4810 },
    { lat: 17.3750, lng: 78.4600 },
    { lat: 17.3890, lng: 78.4950 },
    { lat: 17.4050, lng: 78.4750 },
    { lat: 17.3700, lng: 78.4800 },
  ];

  // Lay out GPS pins with fixed coordinates
  const mapMarkers = (stats.recent_recommendations || []).map((rec, index) => {
    const hash = getHashCode(rec.id);
    const fixedPos = fixedCoordinates[index % fixedCoordinates.length];
    
    const lat = fixedPos.lat;
    const lng = fixedPos.lng;
    
    const severity = rec.priority_score > 85 ? "Critical" : rec.priority_score > 75 ? "High" : rec.priority_score > 60 ? "Medium" : "Low";
    
    // Mock additional data since backend might not have it natively
    const ward = `Ward ${(hash % 50) + 1}`;
    const population = 15000 + (hash % 10) * 5000;
    const budget = `₹${(5 + (hash % 20)).toFixed(1)} Lakhs`;
    const department = 
      (rec.category === "Water Supply" ? "Water Board (HMWSSB)" :
       rec.category === "Roads & Safety" ? "GHMC Road Infrastructure" :
       rec.category === "Health & Hygiene" ? "Health Department" :
       "Municipal Administration");
    
    return {
      id: rec.id,
      lat,
      lng,
      category: rec.category,
      title: rec.title,
      severity,
      priority_score: rec.priority_score,
      ward,
      population,
      budget,
      department
    };
  });

  // Calculate some aggregate values for display
  const pendingCount = stats.status_distribution["pending"] || 0;
  const processingCount = stats.status_distribution["processing"] || 0;
  const completedCount = stats.status_distribution["completed"] || 0;
  const resolvedPercentage = stats.total_issues > 0 
    ? Math.round((completedCount / stats.total_issues) * 100)
    : 100;

  // Extract unique categories and filter lists
  const categories = ["All", ...Array.from(new Set((stats.recent_recommendations || []).map((r) => r.category)))];
  const filteredRecommendations = selectedCategory === "All"
    ? stats.recent_recommendations
    : stats.recent_recommendations.filter((r) => r.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="px-6 pb-12 pt-16 space-y-10"
    >
      <SectionHeading
        eyebrow="Executive Command Center"
        title={t("dashboard.title", "Constituency Development Priorities")}
        description={t("dashboard.description", "Strategy-grade decision dashboard aggregating community complaints, scoring priorities, and organizing ward budgets.")}
      />



      {/* Top Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={t("citizen.recentSignals", "Constituency Pulse")}
          value={stats.total_issues}
          note={`Live complaints queue: ${pendingCount} pending, ${processingCount} analyzing.`}
        />
        <MetricCard
          label={t("dashboard.avgScore", "Average Priority")}
          value={stats.average_priority_score.toFixed(1)}
          suffix="/100"
          note="Scored dynamically on population, health hazards, and infrastructure decay."
        />
        <MetricCard
          label="Resolution Rate"
          value={resolvedPercentage}
          suffix="%"
          note={`${completedCount} of ${stats.total_issues} issues successfully compiled into action briefs.`}
        />
        <MetricCard
          label={t("dashboard.budgetEstimate", "Eligible Scheme Budgets")}
          value="₹84.2"
          suffix=" Lakhs"
          note="Aggregated budget matches from eligible State/Central welfare funding."
        />
      </div>

      {/* Interactive Map & Trend Charts Row */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MapCard
          totalIssuesCount={stats.total_issues}
          analyzedCount={completedCount + processingCount}
          markers={mapMarkers}
          hotspots={[
            { id: "h1", label: "PHC Health Corridor" },
            { id: "h2", label: "Ward 11 Water Logging Belt" }
          ]}
          focusCategory={chartData[0]?.name || "Roads"}
          selectedMarkerId={hoveredMarkerId || newIssueId}
          onMarkerClick={(id) => {
            setHoveredMarkerId(id);
            // Optionally scroll to the card
            document.getElementById(`rec-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />

        <div className="space-y-6">
          {/* Recharts Area Chart */}
          <Card className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-brand-ink">Grievances by Sector</h4>
              <p className="text-xs text-brand-ink-light">Weekly distribution trends across municipal departments</p>
            </div>
            
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrievances" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b97a57" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#b97a57" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6dccf" strokeOpacity={0.4} />
                  <XAxis dataKey="name" stroke="#6e6a64" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255,253,249,0.96)", 
                      borderRadius: "1rem", 
                      border: "1px solid #e6dccf" 
                    }} 
                  />
                  <Area type="monotone" dataKey="Grievances" stroke="#b97a57" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrievances)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Explainability / Grounding Policy Panel */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-line/20 pb-3">
              <HiMiniInformationCircle className="text-brand-terracotta text-lg" />
              <h4 className="text-base font-bold text-brand-ink">Decision Explainability Protocol</h4>
            </div>
            <p className="text-xs leading-5 text-brand-ink-light">
              Decision matrices represent relative weights. This grounding protocol removes individual bias, ensuring constituency capital allocations remain objective, explainable, and audit-ready.
            </p>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">
                  <span>Beneficiary Population (40% Weight)</span>
                  <span className="font-bold text-brand-ink">Active</span>
                </div>
                <div className="h-1 bg-brand-line/45 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-terracotta" style={{ width: "40%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">
                  <span>Grievance Severity (30% Weight)</span>
                  <span className="font-bold text-brand-ink">Active</span>
                </div>
                <div className="h-1 bg-brand-line/45 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-terracotta" style={{ width: "30%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">
                  <span>Government Scheme Alignment (30% Weight)</span>
                  <span className="font-bold text-brand-ink">Active</span>
                </div>
                <div className="h-1 bg-brand-line/45 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-terracotta" style={{ width: "30%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recommendations Feed Directory */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-brand-line/20 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <HiMiniFolderOpen className="text-brand-terracotta text-lg" />
            <h3 className="text-xl font-bold text-brand-ink">{t("dashboard.recommendationsList", "Prioritized Action Directory")}</h3>
          </div>
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-terracotta text-white shadow-sm"
                    : "bg-brand-line/20 text-brand-ink-light hover:bg-brand-line/40"
                }`}
              >
                {cat === "All" ? t("dashboard.filterAll", "All") : cat}
              </button>
            ))}
          </div>
        </div>

        {filteredRecommendations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecommendations.map((rec, idx) => {
              const isCardHighlighted = rec.id === newIssueId || rec.id === hoveredMarkerId;
              return (
                <div
                  key={rec.id}
                  id={`rec-card-${rec.id}`}
                  onMouseEnter={() => setHoveredMarkerId(rec.id)}
                  onMouseLeave={() => setHoveredMarkerId(null)}
                  className="transition-all duration-300"
                >
                  <RecommendationCard
                    id={rec.id}
                    priorityNumber={idx + 1}
                    title={rec.title}
                    category={rec.category}
                    confidence={92}
                    needScore={rec.priority_score}
                    impactScore={rec.priority_score - 5}
                    fundingScore={rec.priority_score - 10}
                    isHighlighted={isCardHighlighted}
                    onClick={() => {
                      setHoveredMarkerId(rec.id);
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-brand-ink-light">
            {t("dashboard.recommendationsDesc", "No actionable recommendations have been generated yet. Submit a grievance to trigger scoring.")}
          </Card>
        )}
      </div>
    </motion.div>
  );
};
