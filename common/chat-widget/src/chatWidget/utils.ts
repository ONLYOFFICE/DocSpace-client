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
