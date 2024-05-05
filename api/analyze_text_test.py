import requests


def analyze_text(text):
    data = {"text": text}
    print("analyze_text_test entered")
    response = requests.post("http://localhost:3000/api/analyze_text", json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to analyze text"}


# Test the analyze_text function
text_to_analyze = "What is your favorite part of being a designer?"
result = analyze_text(text_to_analyze)
print("Analysis Result:", result)
