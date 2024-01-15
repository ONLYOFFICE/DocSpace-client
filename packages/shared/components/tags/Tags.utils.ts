import type { TagType } from "./Tags.types";

export const isTagType = (tag: TagType | string): tag is TagType => {
  return typeof tag === "object";
};
