from fastapi import FastAPI
from chat_with_felix_groq import analyze_excerpt
from groq import Groq

app = FastAPI()


@app.get("/api/python")
def hello_world():
    return {"message": "Hello World"}
