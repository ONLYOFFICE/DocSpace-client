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

  return newMsg.replace("@", "");
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
