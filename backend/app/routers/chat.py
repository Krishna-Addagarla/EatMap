import requests
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Annotated

from app.config import get_settings
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    system: str
    messages: list[ChatMessage]


@router.post("")
def chat(
    payload: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    settings = get_settings()
    api_key = settings.anthropic_api_key

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Anthropic API key is not configured on the server. Please set ANTHROPIC_API_KEY.",
        )

    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": settings.anthropic_model,
                "max_tokens": 1000,
                "system": payload.system,
                "messages": [msg.model_dump() for msg in payload.messages],
            },
            timeout=30.0,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to Anthropic API: {str(exc)}",
        )

    if not response.ok:
        try:
            error_data = response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown Anthropic API error")
        except ValueError:
            error_msg = response.text
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Anthropic API error: {error_msg}",
        )

    try:
        return response.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Received invalid JSON response from Anthropic API",
        )
