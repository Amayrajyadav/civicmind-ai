import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from .firebase_service import FirebaseService, use_mock, db_client
from .gemini_service import GeminiService

logger = logging.getLogger("civicmind_processing")

# In-memory progress tracking for active/recent tasks
ACTIVE_PROGRESS: Dict[str, Dict[str, Any]] = {}

class ProcessingService:
    @staticmethod
    def get_progress_status(issue_id: str, issue_doc: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        # Check active in-memory tasks first
        if issue_id in ACTIVE_PROGRESS:
            return ACTIVE_PROGRESS[issue_id]
        
        # Fallback to database state
        now = datetime.utcnow().isoformat()
        if issue_doc:
            status = issue_doc.get("status", "pending")
            if status == "completed":
                return {
                    "issue_id": issue_id,
                    "status": "completed",
                    "progress": 1.0,
                    "message": "Analysis complete. Recommendation generated successfully.",
                    "updated_at": issue_doc.get("updated_at", now)
                }
            elif status == "failed":
                return {
                    "issue_id": issue_id,
                    "status": "failed",
                    "progress": 1.0,
                    "message": "AI analysis processing failed. Please check backend logs.",
                    "updated_at": issue_doc.get("updated_at", now)
                }
            elif status == "processing":
                return {
                    "issue_id": issue_id,
                    "status": "processing",
                    "progress": 0.5,
                    "message": "Decision intelligence engine is actively analyzing the report...",
                    "updated_at": issue_doc.get("updated_at", now)
                }
            else:
                return {
                    "issue_id": issue_id,
                    "status": "pending",
                    "progress": 0.1,
                    "message": "Issue registered. Awaiting processing queue...",
                    "updated_at": issue_doc.get("updated_at", now)
                }
        
        # Return generic initial state if not found (will be checked by endpoint)
        return {
            "issue_id": issue_id,
            "status": "pending",
            "progress": 0.0,
            "message": "Initializing...",
            "updated_at": now
        }

    @staticmethod
    async def process_issue_analysis(
        issue_id: str,
        title: str,
        description: str,
        category: str,
        location: str,
        gps_coordinates: Optional[str] = None
    ) -> None:
        now = datetime.utcnow().isoformat()
        logger.info(f"Starting async processing for issue: {issue_id}")
        
        # Phase 1: Upload and Initialization
        ACTIVE_PROGRESS[issue_id] = {
            "issue_id": issue_id,
            "status": "processing",
            "progress": 0.25,
            "message": "Analyzing issue structure and initializing model parameters...",
            "updated_at": now
        }
        await FirebaseService.update_issue_status(issue_id, "processing")
        
        # Simulate slight network delay to make frontend processing animation look realistic and satisfying
        await asyncio.sleep(1.5)

        # Phase 2: Gemini Analysis
        now = datetime.utcnow().isoformat()
        ACTIVE_PROGRESS[issue_id].update({
            "progress": 0.60,
            "message": "Querying Google Gemini for decision intelligence and priority scoring...",
            "updated_at": now
        })
        logger.info(f"[{issue_id}] Calling Gemini AI...")

        try:
            # Trigger Gemini Service
            analysis_result = await GeminiService.analyze_issue(
                title=title,
                description=description,
                category=category,
                location=location,
                gps_coordinates=gps_coordinates
            )

            logger.info(f"[{issue_id}] Gemini completed. Storing recommendation...")

            # Phase 3: Storing recommendations
            now = datetime.utcnow().isoformat()
            ACTIVE_PROGRESS[issue_id].update({
                "progress": 0.85,
                "message": "Storing parsed recommendation details in database...",
                "updated_at": now
            })

            # Check if category was updated/auto-detected by Gemini, update issue accordingly
            detected_category = analysis_result.get("category")
            if detected_category and detected_category != category:
                # Update category in original issue
                issue_doc = await FirebaseService.get_issue(issue_id)
                if issue_doc:
                    issue_doc["category"] = detected_category
                    if not use_mock and db_client:
                        db_client.collection("issues").document(issue_id).set(issue_doc)

            # Save the Recommendation document
            await FirebaseService.create_recommendation(issue_id, analysis_result)
            
            # Phase 4: Completed
            now = datetime.utcnow().isoformat()
            ACTIVE_PROGRESS[issue_id].update({
                "status": "completed",
                "progress": 1.0,
                "message": "Decision recommendations generated and Action Brief created successfully.",
                "updated_at": now
            })
            await FirebaseService.update_issue_status(issue_id, "completed")
            logger.info(f"Successfully processed issue: {issue_id}")

        except Exception as e:
            logger.error(f"Error during issue processing: {e}")
            now = datetime.utcnow().isoformat()
            ACTIVE_PROGRESS[issue_id].update({
                "status": "failed",
                "progress": 1.0,
                "message": f"Processing error: {str(e)}",
                "updated_at": now
            })
            await FirebaseService.update_issue_status(issue_id, "failed")
