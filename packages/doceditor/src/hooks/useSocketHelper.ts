"use client";

import React from "react";

import SocketIOHelper from "@docspace/shared/utils/socket";
import { getRestoreProgress } from "@docspace/shared/api/portal";
import { EDITOR_ID } from "@docspace/shared/constants";

import { UseSocketHelperProps } from "@/types";

const useSocketHelper = ({ socketUrl }: UseSocketHelperProps) => {
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

    setSocketHelper(socketIOHelper);
  }, [socketHelper, socketUrl]);

  return { socketHelper };
};

export default useSocketHelper;
