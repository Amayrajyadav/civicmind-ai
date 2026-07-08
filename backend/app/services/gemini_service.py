import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from ..config import settings
from ..prompts.templates import ISSUE_ANALYSIS_PROMPT

# Import the schemas for structured output definition
# We import both the Pydantic schemas and the SDK
logger = logging.getLogger("civicmind_gemini")

client = None
sdk_available = False

try:
    from google import genai
    from google.genai import types
    sdk_available = True
except ImportError:
    logger.warning("google-genai SDK is not installed or import failed. Using mock Gemini calls.")

if sdk_available and settings.is_gemini_configured:
    try:
        # Initialize the GenAI Client
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info(f"Google Gen AI SDK client successfully initialized (Model: {settings.GEMINI_MODEL}).")
    except Exception as e:
        logger.error(f"Failed to initialize Google Gen AI Client: {e}. Fallback to mock is active.")
        client = None
else:
    logger.info("Google Gen AI SDK not initialized (missing API key or force mock). Fallback to mock is active.")


class GeminiService:
    @staticmethod
    async def analyze_issue(
        title: str,
        description: str,
        category: str,
        location: str,
        gps_coordinates: Optional[str] = None
    ) -> Dict[str, Any]:
        # Form the prompt
        prompt = ISSUE_ANALYSIS_PROMPT.format(
            title=title,
            description=description,
            category=category or "Uncategorized",
            location=location or "Unknown",
            gps_coordinates=gps_coordinates or "None"
        )

        # Attempt to run Gemini analysis
        if client and sdk_available:
            logger.info(f"Submitting issue for Gemini analysis (Model: {settings.GEMINI_MODEL})...")
            
            # Import the target response model to enforce structured output schema
            from ..schemas.recommendation import RecommendationBase
            
            # Call Gemini async API using client.aio
            response = await client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RecommendationBase,
                    temperature=0.2,
                ),
            )
            
            # Response text should be a valid JSON matching RecommendationBase
            result_json = response.text
            logger.info("Gemini response received and parsed as structured schema.")
            
            # Parse JSON string back to dict
            return json.loads(result_json)
        
        # No API key configured – use keyword-based mock for hackathon demo
        logger.warning("No Gemini client available. Using mock recommendation generator.")
        return GeminiService.generate_mock_recommendation(title, description, category, location, gps_coordinates)

    @staticmethod
    def generate_mock_recommendation(
        title: str,
        description: str,
        category: str,
        location: str,
        gps_coordinates: Optional[str] = None
    ) -> Dict[str, Any]:
        logger.info("Generating localized mock recommendation report...")
        title_lower = title.lower()
        desc_lower = description.lower()
        
        # Heuristic to detect topic
        if "water" in title_lower or "pipe" in title_lower or "leak" in title_lower or "drain" in title_lower:
            detected_category = "Water Supply"
            severity = "High"
            urgency = "Immediate"
            scheme = "Jal Jeevan Mission (Urban)"
            priority_score = 82
            dept = "Municipal Water Works & Sewerage Board"
            budget = "₹50,000 - ₹80,000"
            timeline = "24-48 Hours"
            steps = [
                "Deploy plumbing crew to locate source blockage or burst joint.",
                "Isolate local sector main water feed valve.",
                "Excavate soil and replace ruptured pipe length.",
                "Flush pipeline, verify chlorine levels, and restore supply.",
                "Close excavation with concrete patch."
            ]
            impact = "Restores safe drinking water supply, avoids road erosion, and limits clean water waste."
        elif "garbage" in title_lower or "dump" in title_lower or "waste" in title_lower or "trash" in title_lower or "smell" in title_lower:
            detected_category = "Sanitation & Waste"
            severity = "Critical"
            urgency = "High"
            scheme = "Swachh Bharat Mission 2.0"
            priority_score = 89
            dept = "Municipal Solid Waste Management Department"
            budget = "₹20,000 - ₹35,000"
            timeline = "3 Days"
            steps = [
                "Dispatch waste collection trucks to clear accumulated garbage pile.",
                "Disinfect site with bleach, lime powder, and odor control spray.",
                "Erect permanent warning signage indicating dumping fines.",
                "Establish commercial size covered bins in a designated zone.",
                "Initiate local awareness drives with resident welfare groups."
            ]
            impact = "Eradicates vectors of disease (flies, dogs), improves visual aesthetics, and safeguards public health."
        elif "light" in title_lower or "dark" in title_lower or "safety" in title_lower or "pothole" in title_lower or "road" in title_lower:
            detected_category = "Roads & Public Safety"
            severity = "High"
            urgency = "High"
            scheme = "Smart Cities Mission / PWD Development Fund"
            priority_score = 78
            dept = "Public Works Department (PWD) - Electrical division"
            budget = "₹90,000 - ₹1,50,000"
            timeline = "5-7 Days"
            steps = [
                "Conduct lighting grid survey to identify wiring damage or short circuits.",
                "Procure energy-efficient LED fixtures (120W replacement standard).",
                "Deploy utility crane truck to replace broken streetlamp units.",
                "Optimize automated twilight/daylight sensor operations.",
                "Establish bi-weekly maintenance patrol schedule."
            ]
            impact = "Reduces nighttime vehicular accidents, discourages crime/harassment, and enhances public commuter safety."
        else:
            # General fallback
            detected_category = category or "Public Infrastructure"
            severity = "Medium"
            urgency = "Medium"
            scheme = "Local Councillor Constituency Development Fund"
            priority_score = 65
            dept = "Local Ward Development Council"
            budget = "₹30,000 - ₹50,000"
            timeline = "10 Days"
            steps = [
                "Inspect site and assess structural safety or cleanup requirement.",
                "Obtain ward clearance and secure necessary funding.",
                "Execute clean up, patch up, or structural renovation.",
                "Conduct resident review meeting to confirm resolution."
            ]
            impact = "Resolves citizen distress, maintains municipal order, and demonstrates active administrative presence."

        gps_val = gps_coordinates or "12.9716, 77.5946"

        action_brief_md = f"""# OFFICIAL CIVIC ACTION REPORT: {title.upper()}

**TO**: Office of the Member of Parliament / Local Ward Commissioner  
**FROM**: CivicMind AI Decision Support Platform  
**DATE**: {datetime.utcnow().strftime('%B %d, %Y')}  
**STATUS**: URGENT DEPLOYMENT ADVISED  

---

### 1. Project Overview
- **Issue ID**: Mock-Gen-ID  
- **Location**: {location or 'Not Specified'}  
- **GPS Reference**: {gps_val}  
- **Subject**: {title}  

### 2. Executive Summary
The submitted issue regarding *"{title}"* has been evaluated by the CivicMind decision engine. The findings reveal a {severity.lower()} severity situation requesting {urgency.lower()} execution. Neglecting this issue risks escalating local citizen dissatisfaction and potential secondary public safety concerns.

### 3. Allocation and Costs
- **Assigned Department**: {dept}  
- **Recommended Funding Program**: {scheme}  
- **Cost Estimate**: {budget}  
- **Target Resolution SLA**: {timeline}  

### 4. Implementation Steps
{"".join([f"{i+1}. **{step}**\\n" for i, step in enumerate(steps)])}
### 5. Social and Civic Impact
By completing these actions, local administration will achieve: *{impact}*
"""

        # Return dict matching RecommendationBase
        return {
            "category": detected_category,
            "severity": severity,
            "urgency": urgency,
            "summary": f"Citizen reported issue: '{title}'. Details: {description[:120]}...",
            "gps": gps_val,
            "duplicate_cluster": f"{detected_category} complaints in {location or 'Local Ward'}",
            "affected_population": "Approx. 100-300 residents nearby",
            "recommended_government_scheme": scheme,
            "priority_score": priority_score,
            "reasoning": f"This issue is marked as {severity} priority with {urgency} urgency because it directly impacts local accessibility, safety, or public health in {location or 'the local area'}.",
            "timeline": timeline,
            "estimated_impact": impact,
            "action_brief": {
                "title": f"Civic Action Brief: {title}",
                "executive_summary": f"This brief addresses the critical citizen report of {title} in {location}. High priority is recommended due to immediate community impact.",
                "assigned_department": dept,
                "budget_estimate": budget,
                "timeline": timeline,
                "action_steps": steps,
                "stakeholders": ["Local Area Residents", f"{dept} Operations Crew", "District Administration"],
                "markdown_report": action_brief_md
            }
        }
