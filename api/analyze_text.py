# api/analyze_text.py
# print("reading analyze_text.py")
from http.server import BaseHTTPRequestHandler
import json
import os
import pusher
from api.chat_with_felix_groq import analyze_excerpt


pusher_client = pusher.Pusher(
    app_id="1793970",
    key="22266158fe1cbe76cc85",
    secret="08d985e9e6e0a2f8fb86",
    cluster="us2",
    ssl=True,
)


def analyze_text(excerpt):
    print("receiving!!!" + excerpt.text)
    analysis_result = analyze_excerpt(excerpt)  # Your analysis function
    # Trigger a Pusher event
    print(f"{analysis_result} - Hey, it's working!")
    pusher_client.trigger(
        "my-channel", "new-analysis", {"interview_question": analysis_result}
    )
    return {"return message": "Analysis sent"}


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        print("33")
        content_length = int(self.headers["Content-Length"])  # Gets the size of data
        post_data = self.rfile.read(content_length)  # Gets the data itself
        data = json.loads(post_data.decode("utf-8"))

        # Validate incoming data
        if "text" not in data:
            self.send_error(400, "Bad Request: Missing 'text' field.")
            return

        text = data["text"]
        print("44")

        # Perform text analysis
        print("47")
        analysis_result = analyze_excerpt(text)
        print("49")

        if analysis_result != "":
            pusher_client.trigger(
                "my-channel",
                "new-analysis",
                {"interview_question": "What are your stregths?"},
            )
        print("55")
        # Send JSON response

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        print("60")
        response = bytes(json.dumps({"return message": "Analysis sent"}), "utf-8")
        self.wfile.write(response)
