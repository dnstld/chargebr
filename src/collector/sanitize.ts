const DANGEROUS_CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/gu;
const MAX_MESSAGE_CHARACTERS = 2_000;

export function sanitizeMessage(message: string): string {
  if (typeof message !== "string") {
    throw new TypeError("Sanitization accepts strings only");
  }

  const cleaned = message.replace(DANGEROUS_CONTROL_CHARACTERS, "");
  return Array.from(cleaned).slice(0, MAX_MESSAGE_CHARACTERS).join("");
}
