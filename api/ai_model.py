import os
import openai
import json
from dotenv import load_dotenv
import argparse

load_dotenv()


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set in the environment variables")
    openai.api_key = api_key


def generate_animal_facts(animal_name):
    # get_openai_client()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set in the environment variables")
    openai.api_key = api_key
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-0125-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant providing fun and interesting facts about animals.",
                },
                {
                    "role": "system",
                    "content": 'If you get a blank prompt, then you will respond with an empty JSON, i.e., {"has_facts": false, "fun_facts": "", "reasoning": ""}',
                },
                {
                    "role": "system",
                    "content": f"""
                    You are an intelligent assistant providing fun facts about animals. Your task is to provide three fun and interesting facts about the given animal. Here are examples for guidance:

                    Example 1:
                    Animal: "Elephant"
                    Assistant: Elephants are the largest land animals on Earth. They have a highly developed brain and show a range of emotions including joy, playfulness, and grief. Elephants communicate using low-frequency sounds that can travel long distances.

                    Example 2:
                    Animal: "Penguin"
                    Assistant: Penguins are flightless birds that live almost exclusively in the Southern Hemisphere. They have a unique adaptation called counter-shading, where their black and white plumage helps camouflage them in the water. Penguins can drink seawater because their glands filter out the salt.

                    Example 3:
                    Animal: "Dolphin"
                    Assistant: Dolphins are highly intelligent marine mammals known for their playful behavior. They use echolocation to find food and navigate in the water. Dolphins have a sophisticated social structure and can communicate with each other using a variety of clicks, whistles, and body movements.

                    Based on this guidance, provide three fun and interesting facts about the following animal: \"{animal_name}\"
                    """,
                },
                {
                    "role": "system",
                    "content": "You always provide your reasoning for determining the fun facts (if applicable) by starting the explanation with 'Reasoning'.",
                },
            ],
            temperature=0.7,
            max_tokens=150,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
        )
        fun_facts = response["choices"][0]["message"]["content"].strip()
        return {"fun_facts": fun_facts}
    except Exception as e:
        return {"fun_facts": "", "error": f"Error occurred: {str(e)}"}


def test_openai_client():
    try:
        get_openai_client()
        print("OpenAI client initialized successfully.")
        return {"status": "success"}
    except Exception as e:
        print(f"Failed to initialize OpenAI client: {str(e)}")
        return {"status": "failure", "error": str(e)}


def main():
    parser = argparse.ArgumentParser(
        description="Generate fun facts about animals or test OpenAI client."
    )
    parser.add_argument(
        "command",
        type=str,
        choices=["generate", "test_client"],
        help="Command to execute: 'generate' to generate fun facts, 'test_client' to test OpenAI client.",
    )
    parser.add_argument(
        "animal_name",
        type=str,
        nargs="?",
        help="Name of the animal to generate fun facts about (required if command is 'generate').",
    )

    args = parser.parse_args()

    if args.command == "generate":
        if not args.animal_name:
            parser.error("The 'generate' command requires the 'animal_name' argument.")
        result = generate_animal_facts(args.animal_name)
        print(json.dumps(result, indent=2))
    elif args.command == "test_client":
        result = test_openai_client()
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
