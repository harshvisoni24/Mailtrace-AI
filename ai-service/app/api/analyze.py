from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.ml.rule_engine import score_email, build_recommended_actions
from app.services.gemini_service import generate_explanation_and_story

router = APIRouter()


class AuthPayload(BaseModel):
    spf: Optional[str] = "UNKNOWN"
    dkim: Optional[str] = "UNKNOWN"
    dmarc: Optional[str] = "UNKNOWN"


class LookalikeDomain(BaseModel):
    trustedDomain: str
    similarityPercent: float


class AttachmentPayload(BaseModel):
    filename: str
    mimeType: str
    sizeBytes: int
    sha256: str


class AnalyzeRequest(BaseModel):
    fromAddress: str
    subject: str
    textBody: Optional[str] = ""
    htmlBody: Optional[str] = ""
    auth: AuthPayload = AuthPayload()
    headerAnomalies: List[str] = []
    lookalikeDomain: Optional[LookalikeDomain] = None
    urls: List[str] = []
    relayIps: List[str] = []
    attachments: List[AttachmentPayload] = []


@router.post("/analyze")
def analyze_email(request: AnalyzeRequest) -> Dict[str, Any]:
    payload = request.model_dump()
    rule_result = score_email(payload)
    explanation = generate_explanation_and_story(rule_result, payload)
    recommended_actions = build_recommended_actions(rule_result["classification"], rule_result["threatScore"])

    return {
        "classification": rule_result["classification"],
        "threatScore": rule_result["threatScore"],
        "scoreFactors": rule_result["scoreFactors"],
        "observedFacts": explanation["observedFacts"],
        "aiInferences": explanation["aiInferences"],
        "unknowns": explanation["unknowns"],
        "attackStory": explanation["attackStory"],
        "becIndicators": rule_result["contentSignals"]["becIndicators"],
        "phishingIndicators": rule_result["contentSignals"]["urgencyIndicators"] + rule_result["contentSignals"]["credentialHarvestingIndicators"],
        "recommendedActions": recommended_actions,
        "aiExplanationSource": explanation["aiExplanationSource"],
    }
