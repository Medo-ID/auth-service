const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    throw new Error("Invalid email");
  }
  return email.toLowerCase();
}

export function validateUsername(username: unknown): string {
  if (typeof username !== "string" || username.length < 4) {
    throw new Error("Invalid username - must be more than 4 characters");
  }
  return username;
}

export function validatePassword(password: unknown): string {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new Error(
      "Weak password - must be more than 8 characters, has at least 1 upper, 1 lower and 1 digit",
    );
  }
  return password;
}
