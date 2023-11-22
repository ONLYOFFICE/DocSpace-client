import type { ContextMenuModel } from "../types";

export function trimSeparator(array: ContextMenuModel[]) {
  if (!array || !Array.isArray(array) || array.length === 0) return array;

  const length = array.length;
  const result: ContextMenuModel[] = [];

  for (let index = 0; index < length; index++) {
    const el = array[index];

    if (el?.isSeparator && result.length > 0) {
      if (result[result.length - 1]?.isSeparator) continue;

      result.push(el);
    } else if (!el?.isSeparator) {
      result.push(el);
    }
  }

  if (result[result.length - 1]?.isSeparator) result.pop();

  return result;
}
