import { checkIsSSR } from "../../utils";

function removeSpecialSymbol(text: string): string {
  return text.replace(/[-_[\]{}()*+!?.,&\\^$|#@%]/g, "");
}

function trim(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function getFirstAndLastChar(text: string): string {
  const [first, ...other] = text.split(" ");

  return (first.at(0) ?? "") + (other.at(-1)?.at(0) ?? "");
}

function toUpperCase(text: string) {
  return text.toUpperCase();
}

export const getRoomTitle = (title: string) => {
  const removeSpecSymbol = removeSpecialSymbol(title);
  const trimText = trim(removeSpecSymbol);
  const firstAndLastChar = getFirstAndLastChar(trimText);

  return toUpperCase(firstAndLastChar);
};

export const encodeToBase64 = (value: string) => {
  if (checkIsSSR()) {
    return Buffer.from(value).toString("base64");
  }

  return window.btoa(value);
};
