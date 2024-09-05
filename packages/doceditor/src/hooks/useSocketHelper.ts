// (c) Copyright Ascensio System SIA 2009-2024
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

import SocketIOHelper from "@docspace/shared/utils/socket";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getRestoreProgress } from "@docspace/shared/api/portal";
import { getUser } from "@docspace/shared/api/people";
import { EDITOR_ID } from "@docspace/shared/constants";

import { UseSocketHelperProps } from "@/types";

const useSocketHelper = ({ socketUrl, user }: UseSocketHelperProps) => {
  const [socketHelper, setSocketHelper] = React.useState<SocketIOHelper | null>(
    null,
  );

  React.useEffect(() => {
    if (socketHelper) return;
    const socketIOHelper = new SocketIOHelper(socketUrl, "");

    socketIOHelper.emit({
      command: "subscribe",
      data: { roomParts: "backup-restore" },
    });

    socketIOHelper.emit({
      command: "subscribe",
      data: { roomParts: user?.id || "" },
    });

    socketIOHelper.on("restore-backup", async () => {
      try {
        const response = await getRestoreProgress();

        if (!response) {
          console.log("Skip denyEditingRights - empty progress response");
          return;
        }
        // const message = t("Common:PreparationPortalTitle");
        const message = "Preparation portal title";

        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        docEditor?.denyEditingRights(message);
      } catch (e) {
        console.error("getRestoreProgress", e);
      }
    });

    socketIOHelper.on("s:logout-session", async (loginEventId) => {
      console.log(`[WS] "logout-session"`, loginEventId, user?.loginEventId);

      if (
        Number(loginEventId) === user?.loginEventId ||
        Number(loginEventId) === 0
      ) {
        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        docEditor?.requestClose();
        window.location.replace(
          combineUrl(window.ClientConfig?.proxy?.url, "/login"),
        );
      }
    });

    setSocketHelper(socketIOHelper);
  }, [socketHelper, socketUrl, user?.id, user?.loginEventId]);

  return { socketHelper };
};

export default useSocketHelper;
