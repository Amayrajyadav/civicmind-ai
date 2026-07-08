import React from "react";
import { Link } from "react-router-dom";
import { Card } from "./Card";
import { Badge } from "./Badge";

// Create custom compact ProgressMetric in the same file to avoid extra file imports if needed, 
// or write it inside a separate file. Let's write it in this file to keep it self-contained!
interface CompactProgressMetricProps {
  label: string;
  value: number;
}

const CompactProgressMetric: React.FC<CompactProgressMetricProps> = ({ label, value }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-brand-ink-light/90">{label}</span>
        <span className="font-semibold text-brand-ink">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-line/30 p-[1px]">
        <div 
          className="h-full rounded-full bg-brand-terracotta" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  id: string;
  priorityNumber: number;
  title: string;
  category: string;
  confidence: number;
  needScore: number;
  impactScore: number;
  fundingScore: number;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  priorityNumber,
  title,
  category,
  confidence,
  needScore,
  impactScore,
  fundingScore,
  isHighlighted = false,
  onClick,
}) => {
  return (
    <Card 
      onClick={onClick}
      className={`flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-all duration-300 cursor-pointer ${
        isHighlighted 
          ? "border-2 border-brand-terracotta bg-brand-terracotta/[0.03] ring-4 ring-brand-terracotta/10" 
          : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <Badge tone="default">Priority #{priorityNumber}</Badge>
              {isHighlighted && (
                <span className="inline-flex items-center rounded-full bg-brand-terracotta text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                  New Signal
                </span>
              )}
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-brand-ink truncate max-w-[14rem]">
              {title}
            </h3>
            <p className="mt-1 text-xs text-brand-ink-light">{category}</p>
          </div>
          
          <div className="rounded-[1.2rem] bg-brand-terracotta/10 px-3 py-2 text-right shrink-0 border border-brand-terracotta/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta">Confidence</p>
            <p className="mt-0.5 text-lg font-bold text-brand-ink">{confidence}%</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <CompactProgressMetric label="Urgency/Need" value={needScore} />
          <CompactProgressMetric label="Public Impact" value={impactScore} />
          <CompactProgressMetric label="Funding Match" value={fundingScore} />
        </div>
      </div>
      
      <Link
        to={`/recommendation-details?issue_id=${id}`}
        className="mt-6 inline-flex text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:underline"
      >
        Inspect Details →
      </Link>
    </Card>
  );
};
export { CompactProgressMetric };
