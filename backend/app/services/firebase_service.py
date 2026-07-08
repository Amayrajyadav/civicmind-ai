import os
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from ..config import settings

logger = logging.getLogger("civicmind_firebase")

# In-memory database for mock fallback
MOCK_ISSUES: Dict[str, Dict[str, Any]] = {}
MOCK_RECOMMENDATIONS: Dict[str, Dict[str, Any]] = {}

# Initialize Firebase SDK
db_client = None
storage_bucket = None
use_mock = True

if settings.is_firebase_configured:
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage

        # Avoid double initialization
        if not firebase_admin._apps:
            if settings.FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                logger.info(f"Initializing Firebase from file: {settings.FIREBASE_SERVICE_ACCOUNT_PATH}")
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET
                })
            else:
                logger.info(f"Initializing Firebase from env variables for project: {settings.FIREBASE_PROJECT_ID}")
                # Clean private key string from env
                private_key = settings.FIREBASE_PRIVATE_KEY
                if private_key:
                    private_key = private_key.replace("\\n", "\n")
                
                cred_dict = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": private_key,
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET
                })
        
        db_client = firestore.client()
        if settings.FIREBASE_STORAGE_BUCKET:
            storage_bucket = storage.bucket()
        use_mock = False
        logger.info("Firebase Firestore and Storage successfully initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}. Falling back to MOCK mode.")
        use_mock = True
else:
    logger.info("Firebase is not configured. Running in MOCK mode.")
    use_mock = True

# Pre-populate Mock Database with realistic data for immediate frontend visualization
if use_mock:
    sample_ids = ["issue_001", "issue_002", "issue_003"]
    
    MOCK_ISSUES["issue_001"] = {
        "id": "issue_001",
        "title": "Water Pipe Burst & Street Flooding",
        "description": "A major clean water pipe burst near the community center. Water is gushing out and flooding the main access road, making it hard to commute and wasting thousands of liters of clean water.",
        "category": "Water Supply",
        "location": "Sector 4, Near Community Center",
        "gps_coordinates": "12.9716, 77.5946",
        "status": "completed",
        "image_urls": ["https://images.unsplash.com/photo-1542060748-10c28b629f6f?q=80&w=600"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    MOCK_RECOMMENDATIONS["issue_001"] = {
        "id": "issue_001",
        "issue_id": "issue_001",
        "category": "Water Supply",
        "severity": "High",
        "urgency": "Immediate",
        "summary": "Clean water pipe rupture in Sector 4 causing localized flooding and water wasting.",
        "gps": "12.9716, 77.5946",
        "duplicate_cluster": "Sector 4 Water System Anomalies",
        "affected_population": "Approx. 500 residents & daily commuters",
        "recommended_government_scheme": "Jal Jeevan Mission (Urban)",
        "priority_score": 85,
        "reasoning": "Ruptured clean water pipeline causes immediate waste of resources and damages local road infrastructure. Lowers water pressure for surrounding residences and presents pedestrian risks.",
        "timeline": "24-48 hours",
        "estimated_impact": "Stops water wastage, resolves community center accessibility issues, and prevents road erosion.",
        "action_brief": {
            "title": "Emergency Brief: Sector 4 Clean Water Pipeline Rupture",
            "executive_summary": "Urgent repairs are needed on the primary supply pipeline near the community center to prevent structural damage, halt clean water wastage, and restore local pressure.",
            "assigned_department": "Municipal Corporation - Water Works Division",
            "budget_estimate": "₹45,000 - ₹60,000",
            "timeline": "24 Hours",
            "action_steps": [
                "Isolate the damaged section by shutting down Sector 4 main valve.",
                "Excavate road surface to expose the ruptured section.",
                "Replace the broken 6-inch PVC segment with a heavy-duty collar joint.",
                "Perform pressure testing and restore supply.",
                "Patch and resurface the excavated asphalt."
            ],
            "stakeholders": [
                "Water Works Engineers",
                "Community Center Directors",
                "Sector 4 Resident Welfare Association"
            ],
            "markdown_report": "# CIVICMIND AI DECISION INTEL BRIEF\n\n**TO**: Member of Parliament / Municipal Commissioner\n**SUBJECT**: Emergency Action Brief: Sector 4 Clean Water Pipeline Rupture\n\n### 1. Executive Summary\nA major clean water pipe burst has been reported near the community center, causing localized flooding and severe wastage of drinking water. Immediate intervention is required to restore services and secure the roadway.\n\n### 2. Administrative Overview\n- **Assigned Department**: Municipal Corporation - Water Works Division\n- **Target Timeline**: 24 Hours\n- **Budget Estimate**: ₹45,000 - ₹60,000\n- **Funding Scheme**: Jal Jeevan Mission (Urban)\n\n### 3. Concrete Action Steps\n1. **Shutdown and Isolation**: Shut down the primary supply valve to isolate the burst pipe segment.\n2. **Excavation & Assessment**: Excavate the flooded asphalt area to inspect pipeline rupture details.\n3. **Component Replacement**: Cut out the broken pipe section and install a reinforced repair collar.\n4. **Restoration**: Refill the cavity, test water pressure, and resurface the roadway.\n\nReport generated by CivicMind AI Decision Support."
        },
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    MOCK_ISSUES["issue_002"] = {
        "id": "issue_002",
        "title": "Open Garbage Dump Near School",
        "description": "People have started dumping household waste right next to the school entrance. It is attracting stray dogs and insects, emitting a terrible smell, and posing a major health risk to school children.",
        "category": "Sanitation & Waste",
        "location": "Greenwood School Lane",
        "gps_coordinates": "12.9750, 77.6000",
        "status": "completed",
        "image_urls": ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    MOCK_RECOMMENDATIONS["issue_002"] = {
        "id": "issue_002",
        "issue_id": "issue_002",
        "category": "Sanitation & Waste",
        "severity": "Critical",
        "urgency": "High",
        "summary": "Hazardous open garbage dumping at Greenwood School entrance, generating health concerns.",
        "gps": "12.9750, 77.6000",
        "duplicate_cluster": "Greenwood Lane Waste Incidents",
        "affected_population": "Over 800 school pupils, staff, and surrounding neighborhood",
        "recommended_government_scheme": "Swachh Bharat Mission 2.0 (Urban)",
        "priority_score": 92,
        "reasoning": "Dumping site is directly adjacent to a school entrance, exposing children to pathogens, vectors (dogs/mosquitoes), and foul odors daily. High transmission risk of waste-borne illness.",
        "timeline": "3-5 days",
        "estimated_impact": "Protects children's health, eliminates vectors, and restores school lane cleanliness.",
        "action_brief": {
            "title": "Sanitation Action Brief: Greenwood School Garbage Crisis",
            "executive_summary": "Immediate removal of garbage and implementation of dumping deterrence at Greenwood School Lane is critical to eliminate biohazard vectors near children.",
            "assigned_department": "Municipal Solid Waste Management Department",
            "budget_estimate": "₹15,000 - ₹25,000 (Initial cleanup and signage)",
            "timeline": "3 Days",
            "action_steps": [
                "Deploy a mechanical waste loader to clear the accumulated garbage.",
                "Disinfect the area with bleaching powder and lime spray.",
                "Install a public notice board and warning sign indicating strict dumping fines.",
                "Place two closed community dustbins 100 meters away from the school.",
                "Request police/councillor patrol during morning hours to catch offenders."
            ],
            "stakeholders": [
                "School Administration",
                "Sanitation Inspectors",
                "Greenwood Welfare Group"
            ],
            "markdown_report": "# CIVICMIND AI DECISION INTEL BRIEF\n\n**TO**: Member of Parliament / Municipal Commissioner\n**SUBJECT**: Sanitation Action Brief: Greenwood School Garbage Crisis\n\n### 1. Executive Summary\nWaste accumulation directly outside Greenwood School poses severe health risks and insect vector hazards. Immediate clearance, sanitization, and regulatory signs are needed.\n\n### 2. Administrative Overview\n- **Assigned Department**: Municipal Solid Waste Management Department\n- **Target Timeline**: 3 Days\n- **Budget Estimate**: ₹15,000 - ₹25,000\n- **Funding Scheme**: Swachh Bharat Mission 2.0\n\n### 3. Action Plan\n- **Cleanup**: Deploy sanitation trucks to remove all raw garbage.\n- **Disinfection**: Spray chemical sanitizers and powder over the location.\n- **Deterrence**: Set up closed bins down the street and install fine warning signs."
        },
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    MOCK_ISSUES["issue_003"] = {
        "id": "issue_003",
        "title": "Broken Streetlights on Highway Underpass",
        "description": "All streetlights under the highway bypass bridge are broken. It gets pitch black after 6 PM. There have been two minor accidents and multiple complaints of safety concerns for women commuting back from work.",
        "category": "Public Safety",
        "location": "National Highway Underpass, Ward 12",
        "gps_coordinates": "12.9800, 77.6100",
        "status": "processing",
        "image_urls": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


class FirebaseService:
    @staticmethod
    async def create_issue(title: str, description: str, category: str, location: str, gps_coordinates: Optional[str] = None, image_urls: List[str] = None) -> str:
        issue_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        issue_doc = {
            "id": issue_id,
            "title": title,
            "description": description,
            "category": category or "Uncategorized",
            "location": location or "Unknown",
            "gps_coordinates": gps_coordinates,
            "status": "pending",
            "image_urls": image_urls or [],
            "created_at": now,
            "updated_at": now
        }
        
        if use_mock:
            MOCK_ISSUES[issue_id] = issue_doc
            logger.info(f"[MOCK] Created issue: {issue_id}")
        else:
            try:
                db_client.collection("issues").document(issue_id).set(issue_doc)
                logger.info(f"[Firestore] Created issue: {issue_id}")
            except Exception as e:
                logger.error(f"Firestore create_issue failed: {e}. Falling back to Mock.")
                MOCK_ISSUES[issue_id] = issue_doc
        
        return issue_id

    @staticmethod
    async def get_issue(issue_id: str) -> Optional[Dict[str, Any]]:
        if use_mock:
            return MOCK_ISSUES.get(issue_id)
        
        try:
            doc = db_client.collection("issues").document(issue_id).get()
            if doc.exists:
                return doc.to_dict()
            return MOCK_ISSUES.get(issue_id) # Fallback to mock just in case
        except Exception as e:
            logger.error(f"Firestore get_issue failed: {e}. Checking Mock.")
            return MOCK_ISSUES.get(issue_id)

    @staticmethod
    async def update_issue_status(issue_id: str, status: str) -> None:
        now = datetime.utcnow().isoformat()
        if use_mock:
            if issue_id in MOCK_ISSUES:
                MOCK_ISSUES[issue_id]["status"] = status
                MOCK_ISSUES[issue_id]["updated_at"] = now
                logger.info(f"[MOCK] Updated issue status {issue_id} -> {status}")
            return

        try:
            db_client.collection("issues").document(issue_id).update({
                "status": status,
                "updated_at": now
            })
            logger.info(f"[Firestore] Updated issue status {issue_id} -> {status}")
        except Exception as e:
            logger.error(f"Firestore update_issue_status failed: {e}. Updating Mock.")
            if issue_id in MOCK_ISSUES:
                MOCK_ISSUES[issue_id]["status"] = status
                MOCK_ISSUES[issue_id]["updated_at"] = now

    @staticmethod
    async def create_recommendation(issue_id: str, rec_data: Dict[str, Any]) -> None:
        now = datetime.utcnow().isoformat()
        rec_doc = {
            "id": issue_id,  # 1:1 pairing
            "issue_id": issue_id,
            **rec_data,
            "created_at": now,
            "updated_at": now
        }
        
        if use_mock:
            MOCK_RECOMMENDATIONS[issue_id] = rec_doc
            logger.info(f"[MOCK] Created recommendation for issue: {issue_id}")
            return

        try:
            db_client.collection("recommendations").document(issue_id).set(rec_doc)
            logger.info(f"[Firestore] Created recommendation for issue: {issue_id}")
        except Exception as e:
            logger.error(f"Firestore create_recommendation failed: {e}. Saving to Mock.")
            MOCK_RECOMMENDATIONS[issue_id] = rec_doc

    @staticmethod
    async def get_recommendation(issue_id: str) -> Optional[Dict[str, Any]]:
        if use_mock:
            return MOCK_RECOMMENDATIONS.get(issue_id)
        
        try:
            doc = db_client.collection("recommendations").document(issue_id).get()
            if doc.exists:
                return doc.to_dict()
            return MOCK_RECOMMENDATIONS.get(issue_id)
        except Exception as e:
            logger.error(f"Firestore get_recommendation failed: {e}. Checking Mock.")
            return MOCK_RECOMMENDATIONS.get(issue_id)

    @staticmethod
    async def get_dashboard_data() -> Dict[str, Any]:
        issues_list = []
        recs_list = []

        if use_mock:
            issues_list = list(MOCK_ISSUES.values())
            recs_list = list(MOCK_RECOMMENDATIONS.values())
        else:
            try:
                # Retrieve from Firestore
                issues_docs = db_client.collection("issues").stream()
                issues_list = [doc.to_dict() for doc in issues_docs]
                
                recs_docs = db_client.collection("recommendations").stream()
                recs_list = [doc.to_dict() for doc in recs_docs]
                
                # If Firestore is completely empty, fallback to mock data so dashboard is not empty
                if not issues_list:
                    issues_list = list(MOCK_ISSUES.values())
                    recs_list = list(MOCK_RECOMMENDATIONS.values())
            except Exception as e:
                logger.error(f"Firestore get_dashboard_data failed: {e}. Fetching Mock.")
                issues_list = list(MOCK_ISSUES.values())
                recs_list = list(MOCK_RECOMMENDATIONS.values())

        # Process stats
        total_issues = len(issues_list)
        
        status_dist = {"pending": 0, "processing": 0, "completed": 0, "failed": 0}
        for issue in issues_list:
            status = issue.get("status", "pending")
            status_dist[status] = status_dist.get(status, 0) + 1
            
        category_dist = {}
        for issue in issues_list:
            cat = issue.get("category", "Uncategorized") or "Uncategorized"
            category_dist[cat] = category_dist.get(cat, 0) + 1

        severity_dist = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        total_priority = 0.0
        analyzed_count = 0
        
        for rec in recs_list:
            sev = rec.get("severity", "Medium")
            severity_dist[sev] = severity_dist.get(sev, 0) + 1
            
            pri = rec.get("priority_score", 0)
            if pri > 0:
                total_priority += pri
                analyzed_count += 1
        
        avg_priority = (total_priority / analyzed_count) if analyzed_count > 0 else 0.0

        # Sort issues and recs to get recent ones
        try:
            sorted_issues = sorted(issues_list, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
            sorted_recs = sorted(recs_list, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
        except Exception:
            sorted_issues = issues_list[:5]
            sorted_recs = recs_list[:5]

        # Map to brief responses
        recent_issues = []
        for i in sorted_issues:
            recent_issues.append({
                "id": i["id"],
                "title": i["title"],
                "category": i.get("category", "Uncategorized") or "Uncategorized",
                "status": i["status"],
                "created_at": i["created_at"]
            })

        recent_recs = []
        for r in sorted_recs:
            recent_recs.append({
                "id": r["id"],
                "issue_id": r["issue_id"],
                "title": r.get("action_brief", {}).get("title", f"Recommendation for {r['id']}"),
                "category": r["category"],
                "severity": r["severity"],
                "urgency": r["urgency"],
                "priority_score": r["priority_score"],
                "created_at": r["created_at"]
            })

        return {
            "total_issues": total_issues,
            "status_distribution": status_dist,
            "category_distribution": category_dist,
            "severity_distribution": severity_dist,
            "average_priority_score": round(avg_priority, 1),
            "recent_issues": recent_issues,
            "recent_recommendations": recent_recs
        }

    @staticmethod
    async def upload_image(file_bytes: bytes, filename: str, content_type: str) -> str:
        if use_mock or not storage_bucket:
            mock_url = f"https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/{filename}?alt=media"
            logger.info(f"[MOCK] Uploaded image to mock Storage: {mock_url}")
            return mock_url
        
        try:
            blob = storage_bucket.blob(f"issues/{uuid.uuid4()}_{filename}")
            # Upload
            blob.upload_from_string(file_bytes, content_type=content_type)
            # Make public or return signed URL. Let's make it public for simplicity
            blob.make_public()
            return blob.public_url
        except Exception as e:
            logger.error(f"Firebase Storage upload failed: {e}. Returning mock URL.")
            return f"https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/{filename}?alt=media"
