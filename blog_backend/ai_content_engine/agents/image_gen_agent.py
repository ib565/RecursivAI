import base64
import logging
import os
from typing import Optional
from google import genai
from google.genai import types
from ai_content_engine.models import HeadlineArticle
from ai_content_engine.prompts import image_gen_prompt


logger = logging.getLogger(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_featured_image(headline_article: HeadlineArticle) -> Optional[str]:
    """
    Generate a featured image for a headline article.

    Args:
        headline_article: The article to generate an image for

    Returns:
        Base64 encoded image data as string, or None if generation fails
    """
    logger.info(f"Starting featured image generation for: {headline_article.headline}")

    # First generate the image prompt
    image_prompt = generate_image_prompt(headline_article)
    if not image_prompt:
        logger.error(
            f"Failed to generate image prompt for: {headline_article.headline}"
        )
        return None

    # Then generate the image from the prompt
    image_base64 = generate_image_from_prompt(image_prompt)
    if not image_base64:
        logger.error(f"Failed to generate image for: {headline_article.headline}")
        return None

    logger.info(
        f"Successfully generated featured image for: {headline_article.headline}"
    )
    return image_base64


def generate_image_from_prompt(image_prompt: str) -> Optional[str]:
    """
    Generate an image from a text prompt using Gemini API.

    Args:
        image_prompt: The text prompt describing the image to generate

    Returns:
        Base64 encoded image data as string, or None if generation fails
    """
    if not image_prompt:
        logger.warning("Empty image prompt provided")
        return None

    logger.info(f"Generating image from prompt: {image_prompt[:100]}...")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=image_prompt,
            config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        # Check if response has candidates
        if not response.candidates:
            logger.warning("No candidates found in Gemini image generation response")
            return None

        # Look for image data in the response parts
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                # Convert image data to base64
                image_data = part.inline_data.data
                image_base64 = base64.b64encode(image_data).decode("utf-8")
                logger.info("Image generated successfully")
                return image_base64
            elif part.text is not None:
                # Log any text response from the model
                logger.debug(f"Gemini text response: {part.text}")

        # If no image found in response
        logger.warning("No image data found in Gemini response")
        return None

    except Exception as e:
        logger.error(
            f"Error generating image from prompt '{image_prompt[:50]}...': {e}"
        )
        return None


def generate_image_prompt(headline_article: HeadlineArticle) -> Optional[str]:
    system_prompt = image_gen_prompt
    logger.info(f"Generating image prompt for: {headline_article.headline}")
    article_text = f"Article:\n"
    article_text += f"Headline: {headline_article.headline}\n"
    article_text += f"Subheading: {headline_article.subheading}\n"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[article_text],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            ),
        )
        result = response.text
        logger.info(f"Image prompt for {headline_article.headline}: {result}")
        return result
    except Exception as e:
        logger.error(
            f"Error generating image prompt for {headline_article.headline}: {e}"
        )
        return None
