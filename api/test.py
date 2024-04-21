def factorial(n):
    """Return the factorial of a positive integer."""
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)


def main():
    num = 5
    print(f"The factorial of {num} is {factorial(num)}")


if __name__ == "__main__":
    main()
