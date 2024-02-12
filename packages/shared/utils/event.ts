export const handleAnyClick = (
  subscribe: boolean,
  handler: (e: MouseEvent | TouchEvent) => void,
) => {
  if (subscribe) {
    document.addEventListener("click", handler);
  } else {
    document.removeEventListener("click", handler);
  }
};
