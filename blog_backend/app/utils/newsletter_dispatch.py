import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any

import requests


logger = logging.getLogger(__name__)

NEWSLETTER_HTML_URL = os.getenv("NEWSLETTER_HTML_URL")
BEEHIIV_API_KEY = os.getenv("BEEHIIV_API_KEY")
BEEHIIV_PUBLICATION_ID = os.getenv("BEEHIIV_PUBLICATION_ID")
BEEHIIV_BASE_URL = os.getenv("BEEHIIV_BASE_URL", "https://api.beehiiv.com/v2").rstrip(
    "/"
)


def _resolve_newsletter_html_url() -> str:
    """Resolve the URL to fetch the rendered newsletter HTML from the frontend."""
    if NEWSLETTER_HTML_URL:
        return NEWSLETTER_HTML_URL
    site_url = os.getenv("NEXT_PUBLIC_SITE_URL")
    if site_url:
        return f"{site_url.rstrip('/')}/api/newsletter-html"
    return "http://localhost:3000/api/newsletter-html"


def fetch_newsletter_html(timeout_seconds: int = 30) -> Optional[str]:
    """Fetch the rendered newsletter HTML from the configured frontend endpoint."""
    url = _resolve_newsletter_html_url()
    try:
        resp = requests.get(url, timeout=timeout_seconds)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        logger.error("Failed to fetch newsletter HTML from %s: %s", url, e)
        return None


def _default_newsletter_title(now: Optional[datetime] = None) -> str:
    now = now or datetime.now()
    return f"RecursivAI's Daily AI Intelligence — {now.strftime('%b %d, %Y')}"


def post_newsletter_to_beehiiv(
    *,
    html_content: Optional[str] = None,
    title: Optional[str] = None,
    subtitle: Optional[str] = None,
    send: bool = False,
    timeout_seconds: int = 30,
) -> Optional[Dict[str, Any]]:
    """Create a Beehiiv post using rendered newsletter HTML and optionally send it."""
    if not BEEHIIV_API_KEY or not BEEHIIV_PUBLICATION_ID:
        logger.error(
            "Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID; cannot post to Beehiiv"
        )
        return None

    html = html_content if html_content is not None else fetch_newsletter_html()
    if not html:
        logger.error("Newsletter HTML content unavailable; aborting Beehiiv post")
        return None

    payload: Dict[str, Any] = {
        "title": title or _default_newsletter_title(),
        "subtitle": subtitle or "",
        "content": html,
        "status": "confirmed" if send else "draft",
    }

    headers = {
        "Authorization": f"Bearer {BEEHIIV_API_KEY}",
        "Content-Type": "application/json",
    }

    url = f"{BEEHIIV_BASE_URL}/publications/{BEEHIIV_PUBLICATION_ID}/posts"
    try:
        resp = requests.post(
            url, headers=headers, json=payload, timeout=timeout_seconds
        )
        if resp.status_code >= 400:
            logger.error("Beehiiv API error %s: %s", resp.status_code, resp.text[:500])
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        logger.error("Error creating Beehiiv post: %s", e)
        return None
