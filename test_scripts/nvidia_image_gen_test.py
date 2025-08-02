import requests
import base64
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()


url = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev"  # returns base64 image

payload = {
    "prompt": "Simple, friendly cartoon-style robot looking puzzled at a stack of colorful, jumbled, and mismatched data blocks. The blocks are askew, suggesting errors or misalignment. Clean lines, no text, plain background. Digital illustration",
    "height": 1024,
    "width": 1024,
    "cfg_scale": 5,
    "mode": "base",
    "image": None,
    "samples": 1,
    "seed": 0,
    "steps": 50,
}
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Bearer {os.getenv('NVIDIA_API_KEY')}",
}

response = requests.post(url, json=payload, headers=headers)

# Parse the response and save the image
response_data = response.json()
if "artifacts" in response_data and len(response_data["artifacts"]) > 0:
    # Get the first image artifact
    image_data = response_data["artifacts"][0]["base64"]

    # Create a timestamp for unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"generated_image_{timestamp}.png"

    # Decode and save the image
    image_bytes = base64.b64decode(image_data)
    with open(filename, "wb") as f:
        f.write(image_bytes)
    print(f"Image saved as: {filename}")
else:
    print("No image data found in response")
    print("Response:", response.text)
