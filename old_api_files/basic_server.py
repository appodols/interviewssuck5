from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, FileResponse
from starlette.websockets import WebSocketDisconnect
import logging
import pusher
from dotenv import load_dotenv

import os

# print("Current working directory:12345", os.getcwd())
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


pusher_client = pusher.Pusher(
    app_id="1793970",
    key="22266158fe1cbe76cc85",
    secret="08d985e9e6e0a2f8fb86",
    cluster="us2",
    ssl=True,
)

# pusher_client = pusher.Pusher(
#     app_id=os.getenv("PUSHER_APP_ID"),
#     key=os.getenv("PUSHER_KEY"),
#     secret=os.getenv("PUSHER_SECRET"),
#     cluster=os.getenv("PUSHER_CLUSTER"),
#     ssl=True,
# )


# Make sure to include the origins you want to allow. Use ["*"] to allow all origins.
origins = [
    "http://localhost:8000",  # Adjust the port if your client is served on a different port
    "http://127.0.0.1:8000",
    "https://interviewbasic.vercel.app",
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
async def analyze_text(excerpt: InterviewExcerpt):
    # print("receiving!!!" + excerpt.text)
    analysis_result = analyze_excerpt(excerpt.text)  # Your analysis function
    # Trigger a Pusher event
    print(f"{analysis_result} - Hey, it's working!")
    pusher_client.trigger(
        "my-channel", "new-analysis", {"pusher message": analysis_result}
    )
    return {"return message": "Analysis sent"}


@app.websocket("/listen")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            logging.info(f"Received data: {data}")
            if data:
                analysis_result = analyze_excerpt(data)
                await websocket.send_json(analysis_result)
            else:
                await websocket.send_text("No data received")
    except WebSocketDisconnect:
        logging.info("WebSocket connection closed by the client.")
    except Exception as e:
        logging.error(f"Unhandled error: {e}")
        await websocket.send_text(f"Error occurred: {str(e)}")
    finally:
        await websocket.close()
        logging.info("WebSocket connection closed.")
