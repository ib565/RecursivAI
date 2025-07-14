import asyncio
import functools
import logging
import random
import time
from typing import Callable, Any, Union, Type, Tuple

logger = logging.getLogger(__name__)


def exponential_backoff_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    backoff_factor: float = 2.0,
    jitter: bool = True,
    exceptions: Union[Type[Exception], Tuple[Type[Exception], ...]] = Exception,
):
    """
    Exponential backoff retry decorator for external API calls.

    Args:
        max_retries: Maximum number of retry attempts (default: 3)
        base_delay: Initial delay in seconds (default: 1.0)
        max_delay: Maximum delay between retries (default: 60.0)
        backoff_factor: Multiplier for exponential backoff (default: 2.0)
        jitter: Whether to add randomness to delay (default: True)
        exceptions: Exception types to retry on (default: Exception)

    Example usage:
        @exponential_backoff_retry(max_retries=3, base_delay=1.0)
        def api_call():
            # Your API call here
            pass

        @exponential_backoff_retry(max_retries=5, exceptions=(ConnectionError, TimeoutError))
        async def async_api_call():
            # Your async API call here
            pass
    """

    def decorator(func: Callable) -> Callable:
        if asyncio.iscoroutinefunction(func):
            return _async_wrapper(func)
        else:
            return _sync_wrapper(func)

    def _sync_wrapper(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None

            for attempt in range(max_retries + 1):  # +1 for initial attempt
                try:
                    result = func(*args, **kwargs)
                    if attempt > 0:
                        logger.info(
                            f"Retry successful for {func.__name__} on attempt {attempt + 1}"
                        )
                    return result

                except exceptions as e:
                    last_exception = e

                    if attempt == max_retries:
                        logger.error(
                            f"Final retry failed for {func.__name__} on attempt {attempt + 1}: {e}"
                        )
                        raise

                    delay = _calculate_delay(
                        attempt, base_delay, backoff_factor, max_delay, jitter
                    )

                    logger.warning(
                        f"Attempt {attempt + 1} failed for {func.__name__}: {e}. "
                        f"Retrying in {delay:.2f} seconds..."
                    )

                    time.sleep(delay)

            # This should never be reached, but just in case
            raise last_exception

        return wrapper

    def _async_wrapper(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            last_exception = None

            for attempt in range(max_retries + 1):  # +1 for initial attempt
                try:
                    result = await func(*args, **kwargs)
                    if attempt > 0:
                        logger.info(
                            f"Retry successful for {func.__name__} after {attempt} attempts"
                        )
                    return result

                except exceptions as e:
                    last_exception = e

                    if attempt == max_retries:
                        logger.error(
                            f"Final retry failed for {func.__name__} after {max_retries} attempts: {e}"
                        )
                        raise

                    delay = _calculate_delay(
                        attempt, base_delay, backoff_factor, max_delay, jitter
                    )

                    logger.warning(
                        f"Attempt {attempt + 1} failed for {func.__name__}: {e}. "
                        f"Retrying in {delay:.2f} seconds..."
                    )

                    await asyncio.sleep(delay)

            # This should never be reached, but just in case
            raise last_exception

        return wrapper

    return decorator


def _calculate_delay(
    attempt: int,
    base_delay: float,
    backoff_factor: float,
    max_delay: float,
    jitter: bool,
) -> float:
    """Calculate delay for the next retry attempt."""
    delay = base_delay * (backoff_factor**attempt)
    delay = min(delay, max_delay)

    if jitter:
        # Add 10-30% jitter to avoid thundering herd problem
        jitter_amount = random.uniform(0.1, 0.3) * delay
        delay += jitter_amount

    return delay
