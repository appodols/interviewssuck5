from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, FileResponse
import logging

import os

print("Current working directory:12345", os.getcwd())
# from fastapi.templating import Jinja2Templates
from typing import Dict, Callable
from deepgram import Deepgram
from dotenv import load_dotenv

# from test import factorial
from fastapi.middleware.cors import CORSMiddleware
from api.chat_with_felix_groq import analyze_excerpt
from pydantic import BaseModel

# import os

load_dotenv()

app = FastAPI()


class InterviewExcerpt(BaseModel):
    text: str


# Make sure to include the origins you want to allow. Use ["*"] to allow all origins.
origins = [
    "http://localhost:8000",  # Adjust the port if your client is served on a different port
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows the specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to my API"}


# @app.get("/", response_class=FileResponse)
# def get(request: Request):
#     return FileResponse("index.html")


@app.post("/analyze-text/")
def analyze_text(excerpt: InterviewExcerpt):
    # print("Analyze text called")
    # Assuming `analyze_excerpt` is a function that takes a string and returns analysis
    analysis_result = analyze_excerpt(excerpt.text)
    print(analysis_result)
    # You return a dictionary because FastAPI automatically converts it to JSON
    return {"analysis": analysis_result}


@app.websocket("/listen")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive text instead of bytes for easier processing
            data = await websocket.receive_text()
            # Process the data using the analyze_excerpt function
            analysis_result = analyze_excerpt(data)
            # Send the analysis result back to the client as JSON
            await websocket.send_json(analysis_result)
    except WebSocketDisconnect:
        logging.info("WebSocket connection closed by the client.")
    except Exception as e:
        logging.error(f"Error occurred: {e}")
        await websocket.send_text(f"Error occurred: {e}")
    finally:
        await websocket.close()
        logging.info("WebSocket connection closed.")
