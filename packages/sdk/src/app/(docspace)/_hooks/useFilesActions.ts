import React from "react";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { frameCallEvent } from "@docspace/shared/utils/common";
import type { TTranslation } from "@docspace/shared/types";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";
import { useMediaViewerStore } from "@/app/(docspace)/_store/MediaViewerStore";

import { useFilesSettingsStore } from "../_store/FilesSettingsStore";
import { useSettingsStore } from "../_store/SettingsStore";

type UseFilesActionsProps = { t: TTranslation };

export default function useFilesActions({ t }: UseFilesActionsProps) {
  const { sdkConfig } = useSDKConfig();
  const { filesSettings } = useFilesSettingsStore();
  const { shareKey } = useSettingsStore();
  const { setMediaViewerData } = useMediaViewerStore();

  const openFile = React.useCallback(
    (
      file: TFileItem,
      preview: boolean = false,
      editForm: boolean = false,
      fillForm: boolean = false,
    ) => {
      if (sdkConfig?.events?.onFileManagerClick) {
        frameCallEvent({
          event: "onFileManagerClick",
          data: file,
        });
        return;
      }
      const fileId = file.id;
      const isMediaOrImage =
        file.viewAccessibility.ImageView || file.viewAccessibility.MediaView;

      if (isMediaOrImage) {
        return setMediaViewerData({ id: file.id, visible: true });
      }

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

      isSameTab = filesSettings?.openEditorInSameTab || isSameTab;

      window.open(url, !isSameTab ? "_blank" : "_self");
    },
    [
      filesSettings?.openEditorInSameTab,
      setMediaViewerData,
      shareKey,
      sdkConfig?.events?.onFileManagerClick,
    ],
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
