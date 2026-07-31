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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import FilesSelector from "@docspace/ui-kit/selectors/Files";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import useGetIcon from "@docspace/ui-kit/ai-agent/hooks/useGetIcon";
import { copyToFolder } from "@docspace/shared/api/files";
import {
  ConflictResolveType,
  DeviceType,
  FolderType,
} from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import useDeviceType from "@/hooks/useDeviceType";

import { useAgentDialogsStore, useAiRoomStore } from "../../_store";

// SDK analogue of the client's `selectFileAiKnowledgeDialogVisible` flow
// (FilesPanels/index.js → <FilesSelector onSelectFile={copyFileToAiKnowledge}>).
// Renders the ui-kit FilesSelector and copies the picked files into the
// agent's knowledge folder via `copyToFolder`. The vectorization is
// triggered server-side by the Knowledge folder type.
const KnowledgeUploadSelectorDialog = observer(() => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useAgentDialogsStore();
  const aiRoomStore = useAiRoomStore();
  const { currentDeviceType } = useDeviceType();
  const { getIcon } = useGetIcon();

  const visible = dialogsStore.selectFileAiKnowledgeDialogVisible;
  const knowledgeId = aiRoomStore.knowledgeId;

  const onClose = React.useCallback(() => {
    dialogsStore.setSelectFileAiKnowledgeDialogVisible(false);
  }, [dialogsStore]);

  const onSubmit = React.useCallback<
    React.ComponentProps<typeof FilesSelector>["onSubmit"]
  >(
    (
      _selectedItemId,
      _folderTitle,
      _isPublic,
      _breadCrumbs,
      _fileName,
      _isChecked,
      _selectedTreeNode,
      selectedFileInfo,
    ) => {
      if (!knowledgeId) {
        onClose();
        return;
      }

      // Multi-select payload is tracked locally via `onSelectItem` —
      // fall back to the single-file `selectedFileInfo` for the case
      // where the user picks a single file and confirms via Enter.
      const ids =
        selectedFilesRef.current.length > 0
          ? selectedFilesRef.current.map((f) => Number(f.id))
          : selectedFileInfo
            ? [Number(selectedFileInfo.id)]
            : [];

      if (ids.length === 0) {
        onClose();
        return;
      }

      copyToFolder(
        Number(knowledgeId),
        [],
        ids,
        ConflictResolveType.Duplicate,
        false,
      )
        .then(() => {
          // Server kicks off vectorization asynchronously; surface a
          // success toast so the user knows the request was accepted.
          toastr.success(t("Common:FilesCopiedNotify"));
        })
        .catch((err) => {
          toastr.error(err instanceof Error ? err.message : String(err));
        });

      selectedFilesRef.current = [];
      onClose();
    },
    [knowledgeId, onClose, t],
  );

  const selectedFilesRef = React.useRef<TSelectorItem[]>([]);
  const onSelectItem = React.useCallback((item: TSelectorItem) => {
    if (item.isFolder) return;
    const idx = selectedFilesRef.current.findIndex((f) => f.id === item.id);
    if (idx >= 0) {
      selectedFilesRef.current = selectedFilesRef.current.filter(
        (f) => f.id !== item.id,
      );
    } else {
      selectedFilesRef.current = [...selectedFilesRef.current, item];
    }
  }, []);

  const getIsDisabled = React.useCallback<
    React.ComponentProps<typeof FilesSelector>["getIsDisabled"]
  >(
    (isFirstLoad, _isSelectedParentFolder, _selectedItemId, _selectedItemType, _isRoot, _selectedItemSecurity, selectedFileInfo) => {
      if (isFirstLoad) return true;
      return (
        selectedFilesRef.current.length === 0 && !selectedFileInfo
      );
    },
    [],
  );

  // Root folder type: USER (My Documents). Same default the client uses
  // when opening the AI knowledge picker — the with*TreeFolder flags
  // expose Rooms / Recent / Favorites / AIAgents branches inside.
  type SdkFolderType = Parameters<
    typeof FilesSelector
  >[0]["rootFolderType"];
  const sdkUserFolderType = FolderType.USER as unknown as SdkFolderType;

  if (!visible) return null;

  return (
    <FilesSelector
      isPanelVisible
      openRoot
      isMultiSelect
      withRecentTreeFolder
      withFavoritesTreeFolder
      withAIAgentsTreeFolder
      isRoomsOnly={false}
      isThirdParty={false}
      withCreate={false}
      withSearch
      withBreadCrumbs
      withoutBackButton
      withCancelButton
      withFooterInput={false}
      withFooterCheckbox={false}
      onCancel={onClose}
      onSubmit={onSubmit}
      onSelectItem={onSelectItem}
      getIcon={getIcon}
      getIsDisabled={getIsDisabled}
      currentFolderId=""
      rootFolderType={sdkUserFolderType}
      disabledItems={[]}
      // FilesSelectorFilterTypes is a `const enum` and the SDK runs with
      // `isolatedModules`, so SWC can't inline its value — passing the
      // string literal directly avoids a runtime import failure.
      filterParam="ALL"
      submitButtonLabel={t("Common:SelectAction", { defaultValue: "Select" })}
      cancelButtonLabel={t("Common:CancelButton", { defaultValue: "Cancel" })}
      descriptionText=""
      footerCheckboxLabel=""
      footerInputHeader=""
      currentFooterInputValue=""
      getFilesArchiveError={() => ""}
      currentDeviceType={currentDeviceType as unknown as DeviceType}
    />
  );
});

export default KnowledgeUploadSelectorDialog;
