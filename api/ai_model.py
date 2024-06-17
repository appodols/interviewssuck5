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
    get_openai_client()
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=f"Tell me 3 fun facts about {animal_name}.",
            max_tokens=150,
            temperature=0.7,
            top_p=1,
            n=1,
            stop=None,
        )
        fun_facts = response.choices[0].text.strip()
        return {"fun_facts": fun_facts}
    except Exception as e:
        return {"fun_facts": "", "error": f"Error occurred: {str(e)}"}


def main():
    parser = argparse.ArgumentParser(description="Generate fun facts about animals.")
    parser.add_argument(
        "animal_name",
        type=str,
        help="Name of the animal to generate fun facts about",
    )

    args = parser.parse_args()

    result = generate_animal_facts(args.animal_name)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
