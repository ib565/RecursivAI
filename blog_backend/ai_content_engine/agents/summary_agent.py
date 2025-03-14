from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import logging
from typing import List
from prompts import weekly_summary_prompt
import time
from google.api_core.exceptions import TooManyRequests, ResourceExhausted


logger = logging.getLogger(__name__)

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_weekly_summary_from_summaries(paper_summaries: List):
    """Generate a weekly summary of the latest AI research papers."""
    paper_summaries_str = "\n\n".join(paper_summaries)

    logger.info("Starting weekly summary generation...")

    for attempt in range(2):  # Maximum of 2 attempts
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[paper_summaries_str],
                config=types.GenerateContentConfig(
                    system_instruction=weekly_summary_prompt,
                    max_output_tokens=8192,
                ),
            )
            logger.info(f"Weekly summary generated. Tokens: {response.usage_metadata}")

            logger.debug(f"Weekly summary generated: {response.text}")
            return response.text

        except (TooManyRequests, ResourceExhausted) as e:
            logger.warning("Rate limit exceeded. Retrying in 60 seconds...")
            if attempt == 0:  # Only sleep before the retry, not after the final attempt
                time.sleep(60)
            else:
                logger.error("Rate limit exceeded after retrying. Exiting.")
                raise e  # If the second attempt also fails, raise the error
