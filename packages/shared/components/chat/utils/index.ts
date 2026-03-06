// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { TTranslation } from "../../../types";
import { LANGUAGE } from "../../../constants";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import getCorrectDate from "../../../utils/getCorrectDate";
import { combineUrl } from "../../../utils/combineUrl";

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

export const getSessionId = (folderId: string | number, userId: string) => {
  return `folder-${folderId}-${userId}-${new Date().getTime()}`;
};

export const getChateTranslationDate = (t: TTranslation, value: string) => {
  return value === "today"
    ? t("Common:Today")
    : value === "yesterday"
      ? t("Common:Yesterday")
      : "";
};

/**
 * Formats a JavaScript object into a nicely formatted JSON string with markdown code block syntax
 * @param obj - The object to format as JSON
 * @returns A string formatted as a markdown code block with JSON syntax highlighting
 */
export const formatJsonWithMarkdown = (
  obj: Record<string, unknown>,
): string => {
  // Format the JSON with 2 space indentation
  const formattedJson = JSON.stringify(obj, null, 2);

  // Return the formatted JSON wrapped in markdown code block syntax
  return `\`\`\`json\n${formattedJson}\n\`\`\``;
};

export const openFile = (id: string) => {
  const searchParams = new URLSearchParams();

  searchParams.set("fileId", id);

  const url = combineUrl(
    window.location.origin,
    `/doceditor?${searchParams.toString()}`,
  );

  window.open(url, "_blank");
};

/**
 * Downloads an image from a URL and converts it to base64
 * @param url - The URL of the image to download
 * @returns A promise that resolves to the base64 encoded string with data URL prefix
 * @throws Error if the image fails to load or the fetch fails
 */
export const downloadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read image blob"));
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(
      `Failed to download image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
