import json
import logging
import os
from typing import Dict, List, Optional, Set, Tuple

from dotenv import load_dotenv
from google import genai
from google.genai import types

from ai_content_engine.models import ArticleSummaryResponse
from ai_content_engine.prompts import ai101_explainer_prompt


logger = logging.getLogger(__name__)
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _get_terms_file_path() -> str:
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.join(base_dir, "data", "ai101_terms.json")
    return data_path


def load_ai101_terms() -> List[Dict[str, object]]:
    """Load AI 101 terms from the static JSON seed file.

    The file should contain a list of objects like:
    {"term": "Retrieval-Augmented Generation", "aliases": ["RAG"]}

    We DO NOT mutate this file at runtime; dedup is handled via DB lookback.
    """
    path = _get_terms_file_path()
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                logger.warning(
                    "AI101 terms JSON is not a list; falling back to defaults"
                )
                return _default_ai101_terms()
            return data
    except FileNotFoundError:
        logger.warning("AI101 terms JSON not found; using default seed list")
        return _default_ai101_terms()
    except Exception as e:
        logger.error(f"Error loading AI101 terms: {e}")
        return _default_ai101_terms()


def _default_ai101_terms() -> List[Dict[str, object]]:
    return [
        {"term": "Retrieval-Augmented Generation", "aliases": ["RAG"]},
        {"term": "Reinforcement Learning from Human Feedback", "aliases": ["RLHF"]},
        {"term": "Function Calling", "aliases": []},
        {"term": "Low-Rank Adaptation", "aliases": ["LoRA"]},
        {"term": "Embeddings", "aliases": []},
        {"term": "Tokenization", "aliases": []},
        {"term": "Prompt Engineering", "aliases": []},
        {"term": "Chain-of-Thought", "aliases": ["CoT"]},
        {"term": "Mixture of Experts", "aliases": ["MoE"]},
        {"term": "Quantization", "aliases": []},
        {"term": "Knowledge Distillation", "aliases": []},
        {"term": "Fine-tuning", "aliases": []},
        {"term": "Zero-shot and Few-shot Learning", "aliases": []},
    ]


def select_ai101_term(used_terms_lower: Set[str]) -> Optional[Tuple[str, List[str]]]:
    """Pick the first term from the seed list that hasn't been used yet.

    used_terms_lower contains lowercased terms that have already been published.
    We do not delete terms from the JSON; we simply skip used ones.
    """
    terms = load_ai101_terms()
    for item in terms:
        term = str(item.get("term", "")).strip()
        if not term:
            continue
        aliases = item.get("aliases") or []

        # Check if any representation collides with used terms
        candidates = {term.lower()} | {str(a).lower() for a in aliases}
        if candidates.isdisjoint(used_terms_lower):
            logger.info(f"AI101 selection: picked term '{term}'")
            return term, list(aliases)

    logger.info("AI101 selection: no unused term found in seed list")
    return None


def generate_ai101_explainer(term: str) -> ArticleSummaryResponse:
    """Generate a concise explainer using the same structured response as news_agent.

    Returns ArticleSummaryResponse with fields: headline, subheading, content.
    """
    prompt_text = f"Term: {term}\n\nWrite an AI 101 explainer."
    logger.info(f"AI101 generation: generating explainer for '{term}'")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt_text],
        config=types.GenerateContentConfig(
            system_instruction=ai101_explainer_prompt,
            response_mime_type="application/json",
            response_schema=ArticleSummaryResponse,
            max_output_tokens=2048,
        ),
    )

    result: ArticleSummaryResponse = response.parsed
    return result
