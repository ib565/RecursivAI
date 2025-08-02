import os
import base64
import logging
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
import time
import random

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Supabase client initialization
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in the environment.")

supabase: Client = create_client(supabase_url, supabase_key)
BUCKET_NAME = "images"


def upload_base64_image(base64_string: str, file_name: str = None) -> str:
    """
    Uploads a base64 encoded image to the Supabase storage bucket with exponential backoff retry.

    :param base64_string: The base64 encoded image.
    :param file_name: Optional file name for the image. If not provided, a random UUID will be used.
    :return: The public URL of the uploaded image.
    """
    max_retries = 3
    base_delay = 1.0  # Start with 1 second delay
    backoff_factor = 2.0  # Double the delay each time

    # Prepare data once before retries
    try:
        # The base64 string might have a prefix e.g. 'data:image/png;base64,'. We need to remove it.
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_data = base64.b64decode(base64_string)

        if not file_name:
            file_name = f"posts/{uuid.uuid4()}.png"
        elif not file_name.startswith("posts/"):
            file_name = f"posts/{file_name}"

    except Exception as e:
        logger.error(f"Error preparing image data for upload: {e}")
        raise

    # Retry loop with exponential backoff
    for attempt in range(max_retries + 1):  # 0, 1, 2, 3 (4 total attempts)
        try:
            logger.info(
                f"Uploading image to Supabase bucket '{BUCKET_NAME}' with path: {file_name}"
                + (f" (attempt {attempt + 1}/{max_retries + 1})" if attempt > 0 else "")
            )

            supabase.storage.from_(BUCKET_NAME).upload(
                path=file_name,
                file=image_data,
                file_options={"content-type": "image/png", "upsert": "true"},
            )

            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)

            if attempt > 0:
                logger.info(
                    f"Successfully uploaded image: {file_name} after {attempt + 1} attempts"
                )
            else:
                logger.info(f"Successfully uploaded image: {file_name}")

            return public_url

        except Exception as e:
            if attempt == max_retries:
                # Final attempt failed, raise the error
                logger.error(
                    f"Failed to upload image {file_name} after {max_retries + 1} attempts: {e}",
                    exc_info=True,
                )
                raise
            else:
                # Calculate delay with jitter to avoid thundering herd
                delay = base_delay * (backoff_factor**attempt)
                jitter = random.uniform(0.1, 0.3) * delay  # 10-30% jitter
                total_delay = delay + jitter

                logger.warning(
                    f"Upload attempt {attempt + 1} failed for {file_name}: {e}. "
                    f"Retrying in {total_delay:.2f} seconds..."
                )
                time.sleep(total_delay)


async def upload_base64_image_async(base64_string: str, file_name: str = None) -> str:
    """
    Async version of upload_base64_image for batch processing.

    :param base64_string: The base64 encoded image.
    :param file_name: Optional file name for the image. If not provided, a random UUID will be used.
    :return: The public URL of the uploaded image.
    """
    import asyncio

    # Run the synchronous upload function in a thread pool
    return await asyncio.to_thread(upload_base64_image, base64_string, file_name)


async def upload_images_batch(
    base64_images: list[str], file_names: list[str] = None
) -> list[str]:
    """
    Upload multiple base64 images in parallel.

    :param base64_images: List of base64 encoded images.
    :param file_names: Optional list of file names. If not provided, UUIDs will be used.
    :return: List of public URLs of the uploaded images.
    """
    import asyncio

    if file_names is None:
        file_names = [None] * len(base64_images)

    if len(base64_images) != len(file_names):
        raise ValueError("base64_images and file_names lists must have the same length")

    # Upload all images in parallel
    tasks = [
        upload_base64_image_async(img, name)
        for img, name in zip(base64_images, file_names)
        if img is not None  # Skip None images
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle any exceptions by converting them to None
    urls = []
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Error uploading image: {result}")
            urls.append(None)
        else:
            urls.append(result)

    return urls
