export function getChatPosition(
  triggerPosition: DOMRect,
  Cwidth: number,
  Cheight: number,
  position?: string
): { top: string; left: string; position?: string } {
  if (!triggerPosition) {
    return { top: "0px", left: "0px" }; // Return empty string if trigger position is not available
  }

  const { width, height } = triggerPosition;

  const distance = 5; // Adjust this value to set the desired distance from the trigger
  if (!position) return { top: distance + height + "px", left: width + "px" };

  switch (position) {
    case "top-left":
      return { top: -distance - Cheight + "px", left: -Cwidth + "px" };
    case "top-center":
      return {
        top: -distance - Cheight + "px",
        left: width / 2 - Cwidth / 2 + "px",
      };
    case "top-right":
      return { top: -distance - Cheight + "px", left: width + "px" };
    case "center-left":
      return {
        top: width / 2 - Cheight / 2 + "px",
        left: -Cwidth - distance + "px",
      };
    case "center-right":
      return {
        top: width / 2 - Cheight / 2 + "px",
        left: width + distance + "px",
      };
    case "bottom-right":
      return { top: distance + height + "px", left: width + "px" };
    case "bottom-center":
      return {
        top: distance + height + "px",
        left: width / 2 - Cwidth / 2 + "px",
      };
    case "bottom-left":
      return { top: distance + height + "px", left: -Cwidth + "px" };
    default:
      return { top: distance + height + "px", left: width + "px" };
  }
}

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
