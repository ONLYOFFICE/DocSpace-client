import { LANGUAGE } from "../../../constants";
import { getCookie } from "../../../utils";
import getCorrectDate from "../../../utils/getCorrectDate";

const fileRegex = /@\d+/g;

/**
 * Removes all folder references (e.g., "@folder-123") from a message
 * @param message - The input message that might contain folder references
 * @returns The cleaned message without folder references
 */
export const removeFolderFromMessage = (message: string): string => {
  const folderRegex = /@folder-\d+/g;

  const newMsg = message.replace(folderRegex, "").trim();

  if (message.match(fileRegex)) return newMsg;

  return newMsg.replaceAll("@", "");
};

/**
 * Extracts file IDs from a message and removes file references
 * @param message - The input message that might contain file references
 * @returns An object containing the cleaned message and an array of file IDs
 */
export const extractFilesFromMessage = (
  message: string,
): {
  cleanedMessage: string;
  fileIds: string[];
} => {
  const fileIds: string[] = [];

  message.matchAll(fileRegex).forEach((match) => {
    fileIds.push(match[0].replace("@", ""));
  });

  const cleanedMessage = message.replaceAll(fileRegex, "").trim();

  return {
    cleanedMessage,
    fileIds,
  };
};

export const getChatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours to compare just the dates
  const dateToCheck = new Date(date);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  dateToCheck.setHours(0, 0, 0, 0);

  if (dateToCheck.getTime() === today.getTime()) {
    return "today";
  }
  if (dateToCheck.getTime() === yesterday.getTime()) {
    return "yesterday";
  }
  const locale = getCookie(LANGUAGE);
  return getCorrectDate(locale || "en", dateToCheck).split(" ")[0];
};
