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

import React from "react";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { frameCallEvent } from "@docspace/shared/utils/common";
import type { TTranslation } from "@docspace/shared/types";

import { useSDKConfig } from "@/providers/SDKConfigProvider";
import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";
import { useMediaViewerStore } from "@/app/(docspace)/_store/MediaViewerStore";

import { OpenFileContext } from "../_contexts/OpenFileContext";
import { useFilesSettingsStore } from "../_store/FilesSettingsStore";
import { useFilesListStore } from "../_store/FilesListStore";
import { useSettingsStore } from "../_store/SettingsStore";

type UseFilesActionsProps = { t: TTranslation };

export default function useFilesActions({ t }: UseFilesActionsProps) {
  const { sdkConfig } = useSDKConfig();
  const { filesSettings } = useFilesSettingsStore();
  const { shareKey } = useSettingsStore();
  const { setMediaViewerData } = useMediaViewerStore();
  const filesListStore = useFilesListStore();
  const openFileOverride = React.useContext(OpenFileContext);

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

      const isMediaOrImage =
        file.viewAccessibility.ImageView || file.viewAccessibility.MediaView;

      if (!isMediaOrImage && openFileOverride) {
        openFileOverride(file, preview);
        return;
      }

      if (isMediaOrImage) {
        return setMediaViewerData({ id: file.id, visible: true });
      }

      const fileId = file.id;

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
      openFileOverride,
    ],
  );

  const copyFileLink = React.useCallback(
    async (itemId: number) => {
      try {
        const itemLink = await api.files.getFileLink(itemId);
        copyShareLink(itemLink.sharedTo.shareLink);
        toastr.success(t("Common:LinkCopySuccess"));
      } catch (error) {
        toastr.error(
          error instanceof Error ? error.message : String(error),
        );
      }
    },
    [t],
  );

  const lockFile = React.useCallback(
    async (file: TFileItem) => {
      const nextLocked = !file.locked;
      try {
        await api.files.lockFile(file.id as number, nextLocked);
        filesListStore.updateItemLocked(file.id, nextLocked);
      } catch (error) {
        toastr.error(
          error instanceof Error ? error.message : String(error),
        );
      }
    },
    [filesListStore],
  );

  const changeCustomFilter = React.useCallback(
    async (file: TFileItem) => {
      const nextEnabled = !file.customFilterEnabled;
      try {
        await api.files.enableCustomFilter(file.id as number, nextEnabled);
        filesListStore.updateItemCustomFilter(file.id, nextEnabled);
        toastr.success(
          nextEnabled
            ? t("Common:CustomFilterEnabled")
            : t("Common:CustomFilterDisabled"),
        );
      } catch (error) {
        toastr.error(
          error instanceof Error ? error.message : String(error),
        );
      }
    },
    [filesListStore, t],
  );

  return { openFile, copyFileLink, lockFile, changeCustomFilter };
}
