import api from "./api";

export interface ActionBriefResponse {
  title: string;
  executive_summary: string;
  assigned_department: string;
  budget_estimate: string;
  timeline: string;
  action_steps: string[];
  stakeholders: string[];
  markdown_report: string;
}

export interface RecommendationResponse {
  id: string;
  issue_id: string;
  category: string;
  severity: string;
  urgency: string;
  summary: string;
  gps: string | null;
  duplicate_cluster: string;
  affected_population: string;
  recommended_government_scheme: string;
  priority_score: number;
  reasoning: string;
  timeline: string;
  estimated_impact: string;
  action_brief: ActionBriefResponse;
  created_at: string;
  updated_at: string;
}

export interface DashboardIssueBrief {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

export interface DashboardRecommendationBrief {
  id: string;
  issue_id: string;
  title: string;
  category: string;
  severity: string;
  urgency: string;
  priority_score: number;
  created_at: string;
}

export interface DashboardStatsResponse {
  total_issues: number;
  status_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  severity_distribution: Record<string, number>;
  average_priority_score: number;
  recent_issues: DashboardIssueBrief[];
  recent_recommendations: DashboardRecommendationBrief[];
}

export const dashboardService = {
  getDashboard: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get<DashboardStatsResponse>("/dashboard");
    return response.data;
  },

  getRecommendation: async (issueId: string): Promise<RecommendationResponse> => {
    const response = await api.get<RecommendationResponse>(`/recommendation/${issueId}`);
    return response.data;
  },

  getActionBrief: async (issueId: string): Promise<ActionBriefResponse> => {
    const response = await api.get<ActionBriefResponse>(`/action-brief/${issueId}`);
    return response.data;
  },
};
