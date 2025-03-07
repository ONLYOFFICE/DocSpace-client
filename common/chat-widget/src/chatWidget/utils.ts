export function getAnimationOrigin(position?: string) {
  if (!position) return "origin-top-left";
  switch (position) {
    case "top-left":
      return "origin-bottom-right";
    case "top-center":
      return "origin-bottom";
    case "top-right":
      return "origin-bottom-left";
    case "center-left":
      return "origin-center";
    case "center-right":
      return "origin-center";
    case "bottom-right":
      return "origin-top-left";
    case "bottom-center":
      return "origin-top";
    case "bottom-left":
      return "origin-top-right";
    default:
      return "origin-top-left";
  }
}

export function extractMessageFromOutput(output: {
  type: string;
  message: any;
}) {
  console.log(output);
  const { type, message } = output;
  if (type === "text") return message;
  if (type === "message") return message.text;
  if (type === "object") return message.text;
  return "Unknown message structure";
}

export function getCurrentWordAtCursor(textarea: HTMLTextAreaElement) {
  // Get the text and cursor position
  const text = textarea.value;
  const cursorPos = textarea.selectionStart;

  // Define word boundaries (spaces, punctuation, etc.)
  const wordBoundaries = /\s|[.,!?;:()[\]{}'"]/;

  // Find the start of the current word
  let startPos = cursorPos;
  while (startPos > 0 && !wordBoundaries.test(text.charAt(startPos - 1))) {
    startPos--;
  }

  // Find the end of the current word
  let endPos = cursorPos;
  while (endPos < text.length && !wordBoundaries.test(text.charAt(endPos))) {
    endPos++;
  }

  // Extract the word
  const currentWord = text.substring(startPos, endPos);

  return { currentWord, startPos, endPos };
}
