// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";

import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { EDITOR_ID } from "@docspace/shared/constants";

import { UseSocketHelperProps } from "@/types";

const useSocketHelper = ({
  socketUrl,
  user,
  shareKey,
  standalone,
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
  }, [user?.id]);

  React.useEffect(() => {
    if (standalone) {
      SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
        roomParts: "restore",
      });
    }
  }, [standalone]);

  React.useEffect(() => {
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
    const callback = async (loginEventId: unknown) => {
      console.log(`[WS] "logout-session"`, loginEventId, user?.loginEventId);

      if (
        Number(loginEventId) === user?.loginEventId ||
        Number(loginEventId) === 0
      ) {
        sessionStorage.setItem("referenceUrl", window.location.href);
        if (user) sessionStorage.setItem("loggedOutUserId", user.id);

        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        docEditor?.requestClose();

        window.location.replace(
          combineUrl(window.ClientConfig?.proxy?.url, "/login"),
        );
      }
    };

    SocketHelper?.on(SocketEvents.LogoutSession, callback);

    return () => {
      SocketHelper?.off(SocketEvents.LogoutSession, callback);
    };
  }, [user, user?.loginEventId]);
};

export default useSocketHelper;
