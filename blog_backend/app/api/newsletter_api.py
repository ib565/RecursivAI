"""Newsletter-related API endpoints."""

from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException

from ..auth import verify_api_key
from ..utils.newsletter_dispatch import post_newsletter_to_beehiiv

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/beehiiv", response_model=Dict[str, Any])
def send_newsletter_to_beehiiv(
    send: bool = False,
    title: str | None = None,
    subtitle: str | None = None,
    override_html: str | None = None,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, Any]:
    """Create or send a Beehiiv post using the rendered newsletter HTML."""

    result = post_newsletter_to_beehiiv(
        html_content=override_html,
        title=title,
        subtitle=subtitle,
        send=send,
    )
    if not result:
        raise HTTPException(status_code=502, detail="Beehiiv API call failed")
    return {"detail": "Beehiiv post created", "beehiiv": result}
