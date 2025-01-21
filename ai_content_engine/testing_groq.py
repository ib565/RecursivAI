from dotenv import load_dotenv
from groq import Groq
import os


load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Say hi!"}], model="llama-3.3-70b-versatile"
)

print(completion.choices[0].message.content)
