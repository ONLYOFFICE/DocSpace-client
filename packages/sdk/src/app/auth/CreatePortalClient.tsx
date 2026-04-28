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

"use client";

import { useEffect, useState } from "react";

import { PreparationPortalProgress } from "@docspace/ui-kit/components/progress-bar";
import { Text } from "@docspace/ui-kit/components/text";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { RoomsType, ShareAccessRights } from "@docspace/ui-kit/enums";

import { createApiKey } from "@docspace/shared/api/api-keys";
import { createRoom, setRoomSecurity } from "@docspace/shared/api/rooms";
import { getGroups } from "@docspace/shared/api/groups";

export default function CreatePortalClient() {
  const [status, setStatus] = useState("Preparing...");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setStatus("Creating API key and rooms...");
        setPercent(10);

        const [apiKeyResult, formRoom, customRoom] = await Promise.all([
          createApiKey({ name: "nextcloud-integration" }),
          createRoom({
            title: "Form Filling Room",
            roomType: RoomsType.FormRoom,
          }),
          createRoom({
            title: "Library",
            roomType: RoomsType.CustomRoom,
          }),
        ]);

        const formRoomId = (formRoom as { id: number }).id;
        const customRoomId = (customRoom as { id: number }).id;
        const apiKey = apiKeyResult.key;

        setStatus("Inviting everyone to the room...");
        setPercent(60);

        const { items: groups } = await getGroups();
        const everyoneGroup = groups.find((g) => g.isSystem);

        if (everyoneGroup) {
          await setRoomSecurity(formRoomId, {
            invitations: [
              {
                id: everyoneGroup.id,
                access: ShareAccessRights.FormFilling,
              },
            ],
            notify: false,
            message: "",
          });
        }

        setStatus("Done!");
        setPercent(100);

        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: "aiform-portal-data",
              apiKey,
              roomId: formRoomId,
              libraryId: customRoomId,
            },
            "*",
          );
        }
      } catch (e) {
        console.error(e);
        const msg =
          (e as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ||
          (e as Error)?.message ||
          "Setup failed";
        setError(msg);
      }
    };

    run();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        gap: "16px",
      }}
    >
      {error ? (
        <Text
          fontSize="14px"
          fontWeight={600}
          color={globalColors.mainRed}
          textAlign="center"
        >
          {error}
        </Text>
      ) : (
        <PreparationPortalProgress percent={percent} text={status} />
      )}
    </div>
  );
}

