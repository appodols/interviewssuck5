from http.server import BaseHTTPRequestHandler, HTTPServer
import json

# the point of this is to test basic shit

print("reading index")


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        response = {"message": "Hello, world!"}
        self.wfile.write(json.dumps(response).encode("utf-8"))
        return


if __name__ == "__main__":
    server_address = ("", 8000)
    httpd = HTTPServer(server_address, handler)
    print("Server running on port 8000...")
    # httpd.serve_forever()
