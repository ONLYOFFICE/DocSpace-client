import React from "react";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import api from "@docspace/shared/api";
import { TFile } from "@docspace/shared/api/files/types";
import { toastr } from "@docspace/shared/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";

import { useFilesSettingsStore } from "../_store/FilesSettingsStore";
import { useSettingsStore } from "../_store/SettingsStore";
import { TTranslation } from "@docspace/shared/types";

type UseFolderActionsProps = { t: TTranslation };

export default function useFolderActions({ t }: UseFolderActionsProps) {
  const { filesSettings } = useFilesSettingsStore();
  const { shareKey } = useSettingsStore();

  const openFile = React.useCallback(
    (
      fileId: number | string,
      preview: boolean = false,
      editForm: boolean = false,
      fillForm: boolean = false,
    ) => {
      const searchParams = new URLSearchParams();

      searchParams.set("fileId", fileId.toString());

      if (shareKey) searchParams.append("share", shareKey);
      if (preview) searchParams.append("action", "view");
      if (editForm) searchParams.append("action", "edit");
      if (fillForm) searchParams.append("action", "fill");

      const url = combineUrl(
        window.location.origin,
        `/doceditor?${searchParams.toString()}`,
      );

      let isSameTab = false;

      if (
        window.navigator.userAgent.includes("ZoomWebKit") ||
        window.navigator.userAgent.includes("ZoomApps")
      )
        isSameTab = true;

      isSameTab = filesSettings!.openEditorInSameTab || isSameTab;

      window.open(url, !isSameTab ? "_blank" : "_self");
    },
    [filesSettings?.openEditorInSameTab, shareKey],
  );

  const copyFileLink = React.useCallback(
    async (itemId: number) => {
      const itemLink = await api.files.getFileLink(itemId);
      copyShareLink(itemLink.sharedTo.shareLink);
      toastr.success(t("Common:LinkCopySuccess"));
    },
    [t],
  );

  return { openFile, copyFileLink };
}
