from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from ai_content_engine.prompts import planner_prompt
from ai_content_engine.models import Outline
import logging
import time
from google.api_core.exceptions import ResourceExhausted, TooManyRequests

logger = logging.getLogger(__name__)

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_outline(paper_text):
    logger.debug("Starting outline generation...")

    for attempt in range(2):  # Maximum of 2 attempts
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[paper_text],
                config=types.GenerateContentConfig(
                    system_instruction=planner_prompt,
                    response_mime_type="application/json",
                    response_schema=Outline,
                    max_output_tokens=8192,
                ),
            )
            logger.info(f"Outline generated. Tokens: {response.usage_metadata}")
            outline: Outline = response.parsed
            logger.debug(f"Outline generated: {outline}")
            return outline

        except (TooManyRequests, ResourceExhausted) as e:
            logger.warning("Rate limit exceeded. Retrying in 60 seconds...")
            if attempt == 0:  # Only sleep before the retry, not after the final attempt
                time.sleep(60)
            else:
                logger.error("Rate limit exceeded after retrying. Exiting.")
                raise e  # If the second attempt also fails, raise the error
