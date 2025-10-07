import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any

import requests


logger = logging.getLogger(__name__)

NEWSLETTER_HTML_URL = os.getenv("NEWSLETTER_HTML_URL")
BUTTONDOWN_API_KEY = os.getenv("BUTTONDOWN_API_KEY")
BUTTONDOWN_BASE_URL = os.getenv(
    "BUTTONDOWN_BASE_URL", "https://api.buttondown.com/v1"
).rstrip("/")


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


def post_newsletter_to_buttondown(
    *,
    html_content: Optional[str] = None,
    title: Optional[str] = None,
    subtitle: Optional[str] = None,
    send: bool = False,
    recipients: Optional[list[str]] = None,
    subscriber_ids: Optional[list[str]] = None,
    timeout_seconds: int = 30,
) -> Optional[Dict[str, Any]]:
    """Create a Buttondown email using rendered newsletter HTML and optionally send it."""

    if not BUTTONDOWN_API_KEY:
        logger.error("Missing BUTTONDOWN_API_KEY; cannot create Buttondown email")
        return None

    html = html_content if html_content is not None else fetch_newsletter_html()
    if not html:
        logger.error("Newsletter HTML content unavailable; aborting Buttondown email")
        return None

    payload: Dict[str, Any] = {
        "subject": title or _default_newsletter_title(),
        "body": html,
    }
    if subtitle:
        payload["description"] = subtitle

    headers = {
        "Authorization": f"Token {BUTTONDOWN_API_KEY}",
        "Content-Type": "application/json",
    }

    create_url = f"{BUTTONDOWN_BASE_URL}/emails"
    try:
        resp = requests.post(
            create_url, headers=headers, json=payload, timeout=timeout_seconds
        )
        if resp.status_code >= 400:
            logger.error(
                "Buttondown email creation error %s: %s",
                resp.status_code,
                resp.text[:500],
            )
        resp.raise_for_status()
        email_data = resp.json()
    except requests.exceptions.RequestException as e:
        logger.error("Error creating Buttondown email: %s", e)
        return None

    result: Dict[str, Any] = {"email": email_data}

    if send:
        email_id = email_data.get("id")
        if not email_id:
            logger.error("Missing email id from Buttondown response; cannot send draft")
            return result

        send_payload: Dict[str, Any] = {}
        if recipients:
            send_payload["recipients"] = recipients
        if subscriber_ids:
            send_payload["subscribers"] = subscriber_ids

        send_url = f"{BUTTONDOWN_BASE_URL}/emails/{email_id}/send-draft"
        try:
            resp = requests.post(
                send_url,
                headers=headers,
                json=send_payload if send_payload else {},
                timeout=timeout_seconds,
            )
            if resp.status_code >= 400:
                logger.error(
                    "Buttondown send-draft error %s: %s",
                    resp.status_code,
                    resp.text[:500],
                )
            resp.raise_for_status()
            # Endpoint returns an empty body on success; capture if present
            result["send_response"] = resp.json() if resp.content else {}
        except requests.exceptions.RequestException as e:
            logger.error("Error sending Buttondown draft: %s", e)
            result["send_error"] = str(e)

    return result
