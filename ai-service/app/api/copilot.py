from typing import Any, Dict, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_service import answer_copilot_question

router = APIRouter()


class CopilotRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None


@router.post("/copilot")
def copilot(request: CopilotRequest) -> Dict[str, Any]:
    return answer_copilot_question(request.question, request.context)
