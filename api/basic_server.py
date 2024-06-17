from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, FileResponse
from starlette.websockets import WebSocketDisconnect
import logging
import pusher
from dotenv import load_dotenv

import os

from typing import Dict, Callable
from dotenv import load_dotenv

from fastapi.middleware.cors import CORSMiddleware
from api.chat_with_felix_groq import analyze_excerpt, provide_recommendation

# this obviously needs to change, with the inputs
from pydantic import BaseModel


# what are the main changes here that I need to post?
#introduce the testing on fastAPI vs process_input


load_dotenv()

app = FastAPI()


class InterviewExcerpt(BaseModel):
    text: str

#this might need to change too



pusher_client = pusher.Pusher(
    app_id="1793970",
    key="22266158fe1cbe76cc85",
    secret="08d985e9e6e0a2f8fb86",
    cluster="us2",
    ssl=True,
)
#this needs to change too, remove the pusher code


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





# #we need to change the input here 
# #it should be called proccess_input
# #remove the blank code part of it
# @app.post("/analyze_text/")
# async def process_input(excerpt: InterviewExcerpt):
#     # print("receiving!!!" + excerpt.text)
#     analysis_result = analyze_excerpt(excerpt.text)  # Your analysis function
#     print(f"Analysis result: {analysis_result}")
#     # # Trigger a Pusher event
#     # print(f"{analysis_result} - Hey, it's working!")
#     if analysis_result["interview_question"] != "":
#         print(f"MUST BE NOT EMPTY : {analysis_result}")
#         pusher_client.trigger(
#             "my-channel", "new-analysis", {"interview_question": analysis_result}
#         )
#         recs = provide_recommendation(analysis_result)
#         pusher_client.trigger(
#             "recs-channel",
#             "new-recommendation",
#             {"recommendation": recs},
#         )
#     return {"return message": analysis_result}










#we need to change the input here 
#it should be called proccess_input
#remove the blank code part of it
@app.post("/analyze_text/")
async def analyze_text(excerpt: InterviewExcerpt):
    # print("receiving!!!" + excerpt.text)
    analysis_result = analyze_excerpt(excerpt.text)  # Your analysis function
    print(f"Analysis result: {analysis_result}")
    # # Trigger a Pusher event
    # print(f"{analysis_result} - Hey, it's working!")
    if analysis_result["interview_question"] != "":
        print(f"MUST BE NOT EMPTY : {analysis_result}")
        pusher_client.trigger(
            "my-channel", "new-analysis", {"interview_question": analysis_result}
        )
        recs = provide_recommendation(analysis_result)
        pusher_client.trigger(
            "recs-channel",
            "new-recommendation",
            {"recommendation": recs},
        )
    return {"return message": analysis_result}







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

