from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ActionBrief(BaseModel):
    title: str = Field(..., description="Official title of the briefing report")
    executive_summary: str = Field(..., description="Brief executive summary for the MP / decision maker")
    assigned_department: str = Field(..., description="Primary department responsible for execution")
    budget_estimate: str = Field(..., description="Estimated cost or budget requirements")
    timeline: str = Field(..., description="Proposed timeline for resolution")
    action_steps: List[str] = Field(..., description="Step-by-step action plan")
    stakeholders: List[str] = Field(..., description="Key stakeholders involved or affected")
    markdown_report: str = Field(..., description="Fully formatted markdown report ready for PDF export or print")

class RecommendationBase(BaseModel):
    category: str = Field(..., description="Auto-detected category of the issue")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")
    urgency: str = Field(..., description="Urgency level: Low, Medium, High, Immediate")
    summary: str = Field(..., description="AI-generated concise summary of the complaint")
    gps: Optional[str] = Field(None, description="Extracted or estimated GPS location")
    duplicate_cluster: Optional[str] = Field("None", description="Identified clusters of duplicate or similar complaints")
    affected_population: str = Field(..., description="Description or estimation of the affected population")
    recommended_government_scheme: str = Field(..., description="Matching government program, fund, or scheme that applies")
    priority_score: int = Field(..., description="Priority score from 1 to 100", ge=1, le=100)
    reasoning: str = Field(..., description="Detailed AI reasoning behind the priority score and urgency")
    timeline: str = Field(..., description="Actionable timeline to resolve the issue")
    estimated_impact: str = Field(..., description="Estimated social/civic impact after solving the issue")
    action_brief: ActionBrief = Field(..., description="The MP-ready briefing report structure and markdown")

class RecommendationResponse(RecommendationBase):
    id: str = Field(..., description="ID of the recommendation (typically matches issue_id)")
    issue_id: str = Field(..., description="Reference ID of the associated issue")
    created_at: str
    updated_at: str
