from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from ai_content_engine.prompts import planner_prompt
from ai_content_engine.models import Outline


load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_outline(paper_text):
    print("Generating outline...")
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
    print("Outline tokens: ", response.usage_metadata)
    outline: Outline = response.parsed
    print("Outline generated.")
    return outline
