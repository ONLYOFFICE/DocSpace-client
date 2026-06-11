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

import { RoomsType, ShareAccessRights } from "@docspace/ui-kit/enums";
import { createRoom, setRoomSecurity } from "@docspace/shared/api/rooms";
import { createFile } from "@docspace/shared/api/files";
import type { TRoom } from "@docspace/shared/api/rooms/types";

export const AI_FORMS_ROOM_TITLE = "AI Forms";
export const AI_FORMS_BLANK_FORM_TITLE = "Untitled form.pdf";

// System group id for "Everyone" — used to invite all portal users at once.
const EVERYONE_GROUP_ID = "c5cc67d1-c3e8-43c0-a3ad-3928ae3e5b5e";

export type AiFormsInstallStepId =
  | "create-room"
  | "invite-everyone"
  | "create-blank-form"
  | "upload-library";

export const AI_FORMS_INSTALL_STEPS: AiFormsInstallStepId[] = [
  "create-room",
  "invite-everyone",
  "create-blank-form",
  "upload-library",
];

export interface InstallAiFormsResult {
  roomId: number;
  libraryId?: number;
}

export type LibraryUploadProgress = {
  uploaded: number;
  total: number;
};

type StreamEvent =
  | { type: "room"; roomId: number }
  | { type: "start"; total: number }
  | { type: "progress"; uploaded: number; total: number }
  | { type: "done"; libraryId: number }
  | { type: "error"; message: string };

const uploadLibraryFromSdk = async (
  onProgress: (p: LibraryUploadProgress) => void,
  signal?: AbortSignal,
): Promise<number | undefined> => {
  const res = await fetch("/sdk/forms/upload-library", {
    method: "POST",
    signal,
  });
  if (!res.ok || !res.body) return undefined;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let libraryId: number | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx = buffer.indexOf("\n");
    while (newlineIdx >= 0) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      newlineIdx = buffer.indexOf("\n");
      if (!line || line.startsWith("#")) continue;
      try {
        const event = JSON.parse(line) as StreamEvent;
        if (event.type === "start") {
          onProgress({ uploaded: 0, total: event.total });
        } else if (event.type === "progress") {
          onProgress({ uploaded: event.uploaded, total: event.total });
        } else if (event.type === "done") {
          libraryId = event.libraryId;
        }
      } catch {
        // Skip malformed lines. Server-side failures arrive as proper
        // { type: "error" } events, not as parse errors.
      }
    }
  }

  return libraryId;
};

export const installAiFormsModule = async (
  onStep: (step: AiFormsInstallStepId) => void,
  onLibraryProgress: (p: LibraryUploadProgress) => void = () => {},
  signal?: AbortSignal,
): Promise<InstallAiFormsResult> => {
  onStep("create-room");
  const room = (await createRoom({
    title: AI_FORMS_ROOM_TITLE,
    roomType: RoomsType.FormRoom,
  })) as TRoom;

  onStep("invite-everyone");
  await setRoomSecurity(room.id, {
    invitations: [
      {
        id: EVERYONE_GROUP_ID,
        access: ShareAccessRights.FormFilling,
      },
    ],
    notify: false,
    message: "",
  });

  onStep("create-blank-form");
  await createFile(room.id, AI_FORMS_BLANK_FORM_TITLE);

  onStep("upload-library");
  let libraryId: number | undefined;
  try {
    libraryId = await uploadLibraryFromSdk(onLibraryProgress, signal);
  } catch (err) {
    // AbortError is expected when the user cancels; let it propagate so the
    // dialog can run uninstallAiForms instead of saving partial state.
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    console.error("AI Forms library upload failed", err);
  }

  return { roomId: room.id, libraryId };
};
