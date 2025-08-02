import os
import base64
import logging
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from ai_content_engine.utils.retry_decorator import exponential_backoff_retry

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


@exponential_backoff_retry()
def upload_base64_image(base64_string: str, file_name: str = None) -> str:
    """
    Uploads a base64 encoded image to the Supabase storage bucket.

    :param base64_string: The base64 encoded image.
    :param file_name: Optional file name for the image. If not provided, a random UUID will be used.
    :return: The public URL of the uploaded image.
    """
    # Prepare image data
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

    # Upload to Supabase (retry logic handled by decorator)
    logger.info(
        f"Uploading image to Supabase bucket '{BUCKET_NAME}' with path: {file_name}"
    )

    supabase.storage.from_(BUCKET_NAME).upload(
        path=file_name,
        file=image_data,
        file_options={"content-type": "image/png", "upsert": "true"},
    )

    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
    logger.info(f"Successfully uploaded image: {file_name}")

    return public_url


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
    base64_images: list[str], file_names: list[str] | None = None
) -> list[str]:
    """
    Upload multiple base64 images in parallel.

    :param base64_images: List of base64 encoded images.
    :param file_names: Optional list of file names. If not provided, UUIDs will be used.
    :return: List of public URLs of the uploaded images (None for failed uploads).
    """
    import asyncio

    if file_names is None:
        file_names = [None] * len(base64_images)

    if len(base64_images) != len(file_names):
        raise ValueError("base64_images and file_names lists must have the same length")

    # Filter out None images and create tasks
    valid_uploads = [
        (img, name, idx)
        for idx, (img, name) in enumerate(zip(base64_images, file_names))
        if img is not None
    ]

    logger.info(f"Starting batch upload of {len(valid_uploads)} images")

    # Upload all valid images in parallel
    tasks = [upload_base64_image_async(img, name) for img, name, _ in valid_uploads]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Build final results list maintaining original order
    urls = [None] * len(base64_images)

    for (img, name, original_idx), result in zip(valid_uploads, results):
        if isinstance(result, Exception):
            logger.error(f"Failed to upload image after all retries: {result}")
            urls[original_idx] = None
        else:
            urls[original_idx] = result

    successful_uploads = sum(1 for url in urls if url is not None)
    logger.info(
        f"Batch upload completed: {successful_uploads}/{len(base64_images)} successful"
    )

    return urls
