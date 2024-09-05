function Compare(...fns: Array<Function>) {
  return (arg: string) => {
    return fns.reduce((composed, fn) => fn(composed), arg);
  };
}

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

export const getRoomTitle = Compare(
  removeSpecialSymbol,
  trim,
  getFirstAndLastChar,
  toUpperCase,
);
