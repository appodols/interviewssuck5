import os
from groq import Groq  # Assuming Groq is a module you have available.
import json
import re
from dotenv import load_dotenv
import argparse

load_dotenv()


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in the environment variables")
    client = Groq(api_key=api_key)
    return client


def analyze_excerpt(excerpt, testing=False):
    # print(excerpt)
    if not excerpt:
        return {"interview_question": ""}

    # Assuming you have set GROQ_API_KEY in your environment variables
    client = get_groq_client()
    try:
        chat_completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {
                    "role": "system",
                    "content": "You will not make questions up unless there is direct evidence of the question from the excerpt",
                },
                {
                    "role": "system",
                    "content": "Your content will be a JSON object with the key 'interview_question' and the value being the extracted interview question. If no question is found, the value should be an empty string.",
                },
                {
                    "role": "system",
                    "content": f"""
                    You are an intelligent assistant analyzing interview transcripts. Your task is to extract important interview questions, ignoring any clarification questions such as 'right?' or small talk like 'how are you doing today?' AND explain your reasoning. Focus on identifying substantial questions that contribute to understanding the interviewee's experience and qualifications. Here are examples for guidance:

                    Example 1:
                    User: "Tell me about a time you had to pivot your product strategy. What led to the pivot?"
                    Assistant: This is an important interview question focusing on the candidate's adaptability and decision-making process.

                    Example 2:
                    User: "Tell me about a time when you had to advocate for additional resources for your project. How do you justify the need and what was the outcome?"
                    Assistant: This is an important interview question as it explores the candidate's negotiation skills and ability to secure resources.

                    Example 3:
                    User: "What projects have you worked on that you're particularly proud of?"
                    Assistant: This is an important interview question focusing on the candidate's past work.

                    Example 4:
                    User: "You're familiar with Python, right?"
                    Assistant: This is a clarification question and should be ignored.

                    Example 5:
                    User: "How are you doing today?"
                    Assistant: This is small talk and should be disregarded.

                    Example 6:
                    User: "Why don't you start with a brief intro?"
                    Assistant: This is an essential interview question

                    Based on this guidance, analyze the following conversation excerpt for important interview questions: \"{excerpt}\"
                    """,
                },
                {
                    "role": "system",
                    "content": "You always provide your reasoning for determining the interview question (if applicable) by starting the explanation with 'Reasoning'",
                },
            ],
            temperature=0.7,
            max_tokens=512,
            top_p=1,
        )
        content_string = chat_completion.choices[0].message.content
        print(content_string)

        # Regex to find the interview question
        interview_question_match = re.search(
            r"Interview question: '([^']+)'", content_string
        )

        # print("Interview question MATCH")
        print(interview_question_match)

        # Extract the groups from the matches if they exist
        interview_question = (
            interview_question_match.group(1) if interview_question_match else ""
        )

        return {"interview_question": interview_question}
    except Exception as e:
        return {"interview_question": "", "reasoning": f"Error occurred: {str(e)}"}


def provide_recommendation(excerpt, testing=False):
    # Assuming you have set GROQ_API_KEY in your environment variables
    client = get_groq_client()
    try:
        chat_completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                # {
                #     "role": "system",
                #     "content": "You will not make questions up unless there is direct evidence of the question from the excerpt",
                # },
                {
                    "role": "system",
                    "content": "You are assistating in a technical interview for a product-management role.  You will be given the value of the current interview question. You will recommend in bullets how the interview should answer the question",
                },
                {
                    "role": "system",
                    "content": "If you don't know the answer, please say I dont know rather than make up an unlikely answer",
                },
                {
                    "role": "system",
                    "content": "You always provide your reasoning for determining the interview question (if applicable) by starting the explanation with 'Reasoning'",
                },
            ],
            temperature=0.7,
            max_tokens=512,
            top_p=1,
        )

        # Accessing the content string
        # Get the content string from the message
        content_string = chat_completion.choices[0].message.content
        print("CONTENT STRING")
        print(content_string)
        # Use regex to find the interview_question and reasoning within the string
        interview_question_match = re.search(
            r'"interview_question":\s*"(.*?)"', content_string
        )

        # print("intervire question")
        # print(interview_question_match)

        reasoning_match = re.search(r'"reasoning":\s*"(.*?)"', content_string)

        # Extract the groups from the matches if they exist
        # interview_question = (
        #     interview_question_match.group(1) if interview_question_match else ""
        # )
        reasoning = reasoning_match.group(1) if reasoning_match else ""

        return {"interview_question": interview_question_match}
    except Exception as e:
        return {"interview_question": "", "reasoning": f"Error occurred: {str(e)}"}


def main():
    parser = argparse.ArgumentParser(description="Process some excerpts.")
    parser.add_argument(
        "command",
        choices=["analyze", "recommend"],
        help="Command to execute (analyze or recommend)",
    )
    parser.add_argument("excerpt", type=str, help="Excerpt text to process")

    args = parser.parse_args()

    if args.command == "analyze":
        result = analyze_excerpt(args.excerpt)
        # print(result)
    elif args.command == "recommend":
        result = provide_recommendation(args.excerpt)
        print(result)


if __name__ == "__main__":
    main()
# user_message = input("Please share the excerpt you would like me to analyze: ")
# analysis_result = analyze_excerpt(user_message)
# print(analysis_result)
