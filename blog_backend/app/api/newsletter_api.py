"""Newsletter-related API endpoints."""

from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException

from ..auth import verify_api_key
from ..utils.newsletter_dispatch import post_newsletter_to_buttondown

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/buttondown", response_model=Dict[str, Any])
def send_newsletter_to_buttondown(
    send: bool = False,
    title: str | None = None,
    subtitle: str | None = None,
    override_html: str | None = None,
    recipients: list[str] | None = None,
    subscriber_ids: list[str] | None = None,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, Any]:
    """Create or send a Buttondown email using the rendered newsletter HTML."""

    result = post_newsletter_to_buttondown(
        html_content=override_html,
        title=title,
        subtitle=subtitle,
        send=send,
        recipients=recipients,
        subscriber_ids=subscriber_ids,
    )
    if not result:
        raise HTTPException(status_code=502, detail="Buttondown API call failed")
    return {"detail": "Buttondown email created", "buttondown": result}
