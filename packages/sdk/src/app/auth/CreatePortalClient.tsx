/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import { useEffect, useState } from "react";

import { PreparationPortalProgress } from "@docspace/ui-kit/components/progress-bar";
import { Text } from "@docspace/ui-kit/components/text";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { RoomsType, ShareAccessRights } from "@docspace/ui-kit/enums";

import { createApiKey } from "@docspace/shared/api/api-keys";
import { createRoom, setRoomSecurity } from "@docspace/shared/api/rooms";

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

        await setRoomSecurity(formRoomId, {
          invitations: [
            {
              id: "c5cc67d1-c3e8-43c0-a3ad-3928ae3e5b5e", // Everyone system group
              access: ShareAccessRights.FormFilling,
            },
          ],
          notify: false,
          message: "",
        });

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

