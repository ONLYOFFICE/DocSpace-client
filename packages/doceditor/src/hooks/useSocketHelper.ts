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

import React from "react";

import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/ui-kit/utils/socket";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { FolderType } from "@docspace/shared/enums";
import { EDITOR_ID } from "@docspace/shared/constants";

import { UseSocketHelperProps } from "@/types";

const useSocketHelper = ({
  socketUrl,
  user,
  shareKey,
  standalone,
  folderId,
  folderType,
}: UseSocketHelperProps) => {
  React.useEffect(() => {
    SocketHelper?.connect(socketUrl, shareKey ?? "");
  }, [shareKey, socketUrl]);

  React.useEffect(() => {
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "restore",
    });

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: user?.id || "",
    });

    if (user?.id)
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: `user-${user.id}-quota`,
      });
  }, [user?.id]);

  React.useEffect(() => {
    if (folderId && folderType === FolderType.Rooms) {
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: `room-${folderId}-quota`,
      });
    }
  }, [folderId]);

  React.useEffect(() => {
    if (standalone) {
      SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
        roomParts: "restore",
      });
    }
  }, [standalone]);

  React.useEffect(() => {
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "tenant-quota",
    });
    // SocketHelper?.emit(SocketCommands.Subscribe, {
    //   roomParts: "QUOTA",
    //   individual: true,
    // });
    const callback = async () => {
      try {
        // const message = t("Common:PreparationPortalTitle");
        const message = "Preparation portal title";

        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        docEditor?.denyEditingRights(message);
      } catch (e) {
        console.error("getRestoreProgress", e);
      }
    };

    SocketHelper?.on(SocketEvents.RestoreBackup, callback);

    return () => {
      SocketHelper?.off(SocketEvents.RestoreBackup, callback);
    };
  }, []);

  React.useEffect(() => {
    const callback = async ({
      loginEventId,
      redirectUrl,
    }: {
      loginEventId: unknown;
      redirectUrl: string | null;
    }) => {
      const eventId = Number(loginEventId);

      if (eventId !== user?.loginEventId && eventId !== 0) return;

      console.log(
        `[WS] "logout-session"`,
        loginEventId,
        user?.loginEventId,
        redirectUrl,
      );

      const { pathname, search, origin } = window.location;
      const loginUrl = redirectUrl || window.ClientConfig?.proxy?.url;

      sessionStorage.setItem(
        "referenceUrl",
        `${redirectUrl || origin}${pathname}${search}`,
      );
      if (user?.id) sessionStorage.setItem("loggedOutUserId", user.id);

      window.DocEditor?.instances[EDITOR_ID]?.requestClose();
      window.location.replace(combineUrl(loginUrl, "/login"));
    };

    SocketHelper?.on(SocketEvents.LogoutSession, callback);

    return () => {
      SocketHelper?.off(SocketEvents.LogoutSession, callback);
    };
  }, [user?.id, user?.loginEventId]);
};

export default useSocketHelper;
