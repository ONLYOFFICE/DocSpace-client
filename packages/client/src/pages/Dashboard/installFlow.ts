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
  | "create-blank-form";

export const AI_FORMS_INSTALL_STEPS: AiFormsInstallStepId[] = [
  "create-room",
  "invite-everyone",
  "create-blank-form",
];

export interface InstallAiFormsResult {
  roomId: number;
}

export const installAiFormsModule = async (
  onStep: (step: AiFormsInstallStepId) => void,
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

  return { roomId: room.id };
};
