from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DashboardIssueBrief(BaseModel):
    id: str
    title: str
    category: str
    status: str
    created_at: str

class DashboardRecommendationBrief(BaseModel):
    id: str
    issue_id: str
    title: str
    category: str
    severity: str
    urgency: str
    priority_score: int
    created_at: str

class DashboardStats(BaseModel):
    total_issues: int = Field(0, description="Total number of submitted issues")
    status_distribution: Dict[str, int] = Field(
        default_factory=dict, 
        description="Counts of issues by status (pending, processing, completed, failed)"
    )
    category_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Counts of issues by category (e.g., Water, Sanitation, Road, etc.)"
    )
    severity_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Counts of issues by severity level (Critical, High, Medium, Low)"
    )
    average_priority_score: float = Field(0.0, description="Average priority score of analyzed issues")
    recent_issues: List[DashboardIssueBrief] = Field(default_factory=list, description="List of most recently submitted issues")
    recent_recommendations: List[DashboardRecommendationBrief] = Field(default_factory=list, description="List of recent recommendations")
