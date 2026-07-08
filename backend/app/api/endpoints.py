import logging
from fastapi import APIRouter, Depends, Form, UploadFile, File, BackgroundTasks, HTTPException, status
from typing import List, Optional
from ..dependencies import get_firebase_service, get_processing_service
from ..schemas.issue import IssueResponse, ProcessingStatusResponse
from ..schemas.recommendation import RecommendationResponse, ActionBrief
from ..schemas.dashboard import DashboardStats

logger = logging.getLogger("civicmind_api")

router = APIRouter()

@router.post(
    "/submit-issue",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit a citizen issue and start analysis",
    description="Accepts issue details via form-data along with optional binary image files. Uploads images to Storage, saves issue to Firestore, and starts Gemini analysis asynchronously in a background task."
)
async def submit_issue(
    background_tasks: BackgroundTasks,
    title: str = Form(..., description="Short title describing the civic issue"),
    description: str = Form(..., description="Detailed description of the civic problem"),
    category: Optional[str] = Form("Uncategorized", description="Category of the issue if known"),
    location: Optional[str] = Form("Unknown", description="General location text or street name"),
    gps_coordinates: Optional[str] = Form(None, description="Comma-separated latitude, longitude"),
    images: Optional[List[UploadFile]] = File(default=[], description="Optional images of the issue"),
    firebase_service = Depends(get_firebase_service),
    processing_service = Depends(get_processing_service)
):
    try:
        image_urls = []
        if images:
            for img in images:
                # Basic file verification
                if not img.filename:
                    continue
                file_bytes = await img.read()
                if len(file_bytes) == 0:
                    continue
                
                # Upload to Firebase Storage
                url = await firebase_service.upload_image(
                    file_bytes, 
                    img.filename, 
                    img.content_type or "image/jpeg"
                )
                image_urls.append(url)

        # Create issue document
        issue_id = await firebase_service.create_issue(
            title=title,
            description=description,
            category=category,
            location=location,
            gps_coordinates=gps_coordinates,
            image_urls=image_urls
        )

        # Launch background worker task for AI recommendation extraction
        background_tasks.add_task(
            processing_service.process_issue_analysis,
            issue_id=issue_id,
            title=title,
            description=description,
            category=category,
            location=location,
            gps_coordinates=gps_coordinates
        )

        return {
            "issue_id": issue_id,
            "status": "pending",
            "message": "Issue submitted successfully. AI analysis has been scheduled in the background."
        }

    except Exception as e:
        logger.error(f"Error submitting issue: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit issue: {str(e)}"
        )


@router.get(
    "/processing/{issue_id}",
    response_model=ProcessingStatusResponse,
    summary="Get issue analysis progress status",
    description="Check the active processing status and percentage completion of the background Gemini analysis."
)
async def get_processing_status(
    issue_id: str,
    firebase_service = Depends(get_firebase_service),
    processing_service = Depends(get_processing_service)
):
    issue_doc = await firebase_service.get_issue(issue_id)
    if not issue_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID '{issue_id}' not found."
        )
    
    # Resolve status dictionary
    status_data = processing_service.get_progress_status(issue_id, issue_doc)
    return status_data


@router.get(
    "/dashboard",
    response_model=DashboardStats,
    summary="Fetch aggregated stats for dashboard",
    description="Retrieves total number of issues, status allocations, categories distribution, and recent complaints for dashboard charts."
)
async def get_dashboard(
    firebase_service = Depends(get_firebase_service)
):
    try:
        stats = await firebase_service.get_dashboard_data()
        return stats
    except Exception as e:
        logger.error(f"Error compiling dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard metrics."
        )


@router.get(
    "/recommendation/{issue_id}",
    response_model=RecommendationResponse,
    summary="Get structured AI recommendation",
    description="Returns the full decision intelligence recommendation parsed by Gemini for the given issue."
)
async def get_recommendation(
    issue_id: str,
    firebase_service = Depends(get_firebase_service)
):
    # Verify the issue exists first
    issue_doc = await firebase_service.get_issue(issue_id)
    if not issue_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID '{issue_id}' not found."
        )

    # Fetch recommendation
    rec_doc = await firebase_service.get_recommendation(issue_id)
    if not rec_doc:
        # Check issue status to provide standard user errors
        status_str = issue_doc.get("status", "pending")
        if status_str in ["pending", "processing"]:
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail=f"Recommendation is still being analyzed. Current status: '{status_str}'."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation could not be found or analysis failed."
            )

    return rec_doc


@router.get(
    "/action-brief/{issue_id}",
    response_model=ActionBrief,
    summary="Fetch MP-ready action report brief",
    description="Extracts and returns only the action brief sub-component of a recommendation, containing official departments and a formatted Markdown report."
)
async def get_action_brief(
    issue_id: str,
    firebase_service = Depends(get_firebase_service)
):
    # Retrieve full recommendation
    rec_doc = await firebase_service.get_recommendation(issue_id)
    if not rec_doc:
        # Check if issue exists to determine error detail
        issue_doc = await firebase_service.get_issue(issue_id)
        if not issue_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Issue with ID '{issue_id}' not found."
            )
        
        status_str = issue_doc.get("status", "pending")
        if status_str in ["pending", "processing"]:
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail=f"Action brief is still generating. Current status: '{status_str}'."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Action brief not found."
            )

    action_brief_data = rec_doc.get("action_brief")
    if not action_brief_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Action brief is malformed or missing inside the recommendation."
        )

    return action_brief_data
