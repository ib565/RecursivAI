import base64
import logging
import os
import asyncio
from typing import Optional, List
from google import genai
from google.genai import types
from ai_content_engine.models import HeadlineArticle
from ai_content_engine.prompts import image_gen_prompt


logger = logging.getLogger(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Fallback prompt constant
FALLBACK_IMAGE_PROMPT = "A generic AI related image with a cartoon style"


async def _generate_single_image_async(prompt: str) -> Optional[str]:
    """Helper function to generate a single image asynchronously."""
    try:
        # Automatically append aspect ratio specification
        enhanced_prompt = f"{prompt}, aspect ratio: 16:9 landscape"

        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=enhanced_prompt,
            config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        if not response.candidates:
            logger.warning(f"No candidates found for prompt: {prompt[:50]}...")
            return None

        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                image_data = part.inline_data.data
                image_base64 = base64.b64encode(image_data).decode("utf-8")
                logger.info("Image generated successfully")
                return image_base64

        logger.warning(f"No image data found for prompt: {prompt[:50]}...")
        return None

    except Exception as e:
        logger.error(f"Error generating image for prompt '{prompt[:50]}...': {e}")
        return None


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
        # Automatically append aspect ratio specification
        enhanced_prompt = f"{image_prompt}, aspect ratio: 16:9 landscape"

        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=enhanced_prompt,
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
    """
    Generate an image prompt for a single headline article.

    Args:
        headline_article: The article to generate a prompt for

    Returns:
        Image prompt string, or None if generation fails
    """
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


async def generate_image_prompts_batch(
    headline_articles: List[HeadlineArticle],
) -> List[str]:
    """
    Generate image prompts for multiple articles in a single API call.

    Args:
        headline_articles: List of articles (max 6) to generate prompts for

    Returns:
        List of image prompt strings
    """
    if len(headline_articles) > 6:
        raise ValueError("Batch size cannot exceed 6 articles")

    logger.info(
        f"Generating image prompts for batch of {len(headline_articles)} articles"
    )

    # Prepare the batch content
    batch_content = "Generate image prompts for the following articles:\n\n"
    for i, article in enumerate(headline_articles, 1):
        batch_content += f"Article {i}:\n"
        batch_content += f"Headline: {article.headline}\n"
        batch_content += f"Subheading: {article.subheading}\n\n"

    batch_content += (
        "\nReturn a list of prompts, one for each article, in order of the articles."
    )

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=[batch_content],
            config=types.GenerateContentConfig(
                system_instruction=image_gen_prompt,
                response_mime_type="application/json",
                response_schema=list[str],
            ),
        )

        prompts: list[str] = response.parsed

        if not isinstance(prompts, list) or len(prompts) != len(headline_articles):
            logger.error(
                f"Invalid response format: expected {len(headline_articles)} prompts, got {len(prompts) if isinstance(prompts, list) else 'non-list'}"
            )
            return [FALLBACK_IMAGE_PROMPT for _ in headline_articles]

        logger.info(f"Successfully generated {len(prompts)} image prompts")
        return prompts

    except Exception as e:
        logger.error(f"Error generating batch image prompts: {e}")
        # Fallback prompts
        return [FALLBACK_IMAGE_PROMPT for _ in headline_articles]


async def generate_images_from_prompts_batch(
    image_prompts: List[str],
) -> List[Optional[str]]:
    """
    Generate images from multiple prompts in parallel (max 6 at a time).

    Args:
        image_prompts: List of image prompts (max 6)

    Returns:
        List of base64 encoded image strings (None for failed generations)
    """
    if len(image_prompts) > 6:
        raise ValueError("Batch size cannot exceed 6 prompts")

    logger.info(f"Generating images for batch of {len(image_prompts)} prompts")

    # Generate all images in parallel using the extracted helper function
    tasks = [_generate_single_image_async(prompt) for prompt in image_prompts]
    results = await asyncio.gather(*tasks)

    successful_count = sum(1 for result in results if result is not None)
    logger.info(
        f"Successfully generated {successful_count}/{len(image_prompts)} images"
    )

    return results


async def generate_featured_images_with_rate_limiting(
    headline_articles: List[HeadlineArticle],
) -> List[Optional[str]]:
    """
    Generate featured images for multiple articles with rate limiting.
    Processes 6 articles at a time with 1-minute delays between batches.

    Args:
        headline_articles: List of articles to generate images for

    Returns:
        List of base64 encoded image strings (None for failed generations)
    """
    logger.info(
        f"Starting batch image generation for {len(headline_articles)} articles"
    )

    all_results = []
    batch_size = 6

    for i in range(0, len(headline_articles), batch_size):
        batch = headline_articles[i : i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(headline_articles) + batch_size - 1) // batch_size

        logger.info(
            f"Processing batch {batch_num}/{total_batches} ({len(batch)} articles)"
        )

        # Generate prompts for this batch
        prompts = await generate_image_prompts_batch(batch)

        # Generate images from prompts
        images = await generate_images_from_prompts_batch(prompts)

        all_results.extend(images)

        # Rate limiting: wait 1 minute between batches (except for the last batch)
        if i + batch_size < len(headline_articles):
            logger.info("Waiting 60 seconds before next batch (rate limiting)...")
            await asyncio.sleep(60)

    logger.info(
        f"Completed batch image generation: {sum(1 for r in all_results if r is not None)}/{len(all_results)} successful"
    )
    return all_results
