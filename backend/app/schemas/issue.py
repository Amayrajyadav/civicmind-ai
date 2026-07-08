from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class IssueCreate(BaseModel):
    title: str = Field(..., description="Short title of the issue", example="Water pipe burst on Main Street")
    description: str = Field(..., description="Detailed description of the issue", example="There is a major water leakage from a broken pipe since morning. The street is flooded.")
    category: Optional[str] = Field("Uncategorized", description="Category of the issue (e.g., Water, Roads, Sanitation, etc.)", example="Water Supply")
    location: Optional[str] = Field("Unknown", description="General text location/address of the issue", example="Main Street, Ward 4")
    gps_coordinates: Optional[str] = Field(None, description="Optional GPS coordinates (latitude, longitude)", example="12.9716, 77.5946")

class IssueResponse(BaseModel):
    id: str = Field(..., description="Unique issue identifier")
    title: str
    description: str
    category: str
    location: str
    gps_coordinates: Optional[str] = None
    status: str = Field(..., description="Status of issue processing: pending, processing, completed, failed")
    image_urls: List[str] = Field(default_factory=list, description="List of uploaded image URLs in Firebase Storage")
    created_at: str
    updated_at: str

class ProcessingStatusResponse(BaseModel):
    issue_id: str = Field(..., description="The ID of the issue being processed")
    status: str = Field(..., description="Current status: pending, processing, completed, failed")
    progress: float = Field(..., description="Progress value between 0.0 and 1.0", example=0.5)
    message: str = Field(..., description="Detailed description of the current phase or error message", example="Gemini is analyzing the issue details...")
    updated_at: str
