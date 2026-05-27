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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit";
import AiAgentProviders, {
  useStores,
  type ComposerAction,
} from "@docspace/ui-kit/ai-agent/providers";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@docspace/ui-kit/ai-agent/providers/themes";
import FilesSelector from "@docspace/ui-kit/selectors/Files";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import useGetIcon from "@docspace/ui-kit/ai-agent/chat/hooks/useGetIcon";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";
import { DeviceType, FileType, FolderType } from "@docspace/shared/enums";
import { getBrandName } from "@docspace/shared/constants/brands";
import CatalogDocumentsUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";

import useDeviceType from "@/hooks/useDeviceType";

type DocSpaceFilesAttachDialogProps = {
  onClose: () => void;
};

// Rendered inside <AiAgentProviders> so `useStores()` resolves the
// AttachmentsStore from the widget's context. `addAttachmentFile` round-trips
// to the AI backend, which resolves the entryId server-side — `content` here
// is a placeholder and is ignored by the host integration.
const DocSpaceFilesAttachDialog = observer(
  ({ onClose }: DocSpaceFilesAttachDialogProps) => {
    const { t } = useTranslation(["Common"]);
    const { currentDeviceType } = useDeviceType();
    const { getIcon } = useGetIcon();
    const { useAttachmentsStore } = useStores();

    const selectedFilesRef = React.useRef<TSelectorItem[]>([]);

    const onSelectItem = React.useCallback((item: TSelectorItem) => {
      if ("isFolder" in item && item.isFolder) return;
      const idx = selectedFilesRef.current.findIndex((f) => f.id === item.id);
      if (idx >= 0) {
        selectedFilesRef.current = selectedFilesRef.current.filter(
          (f) => f.id !== item.id,
        );
      } else {
        selectedFilesRef.current = [...selectedFilesRef.current, item];
      }
    }, []);

    const onSubmit = React.useCallback<
      React.ComponentProps<typeof FilesSelector>["onSubmit"]
    >(
      async (
        _selectedItemId,
        _folderTitle,
        _isPublic,
        _breadCrumbs,
        _fileName,
        _isChecked,
        _selectedTreeNode,
        selectedFileInfo,
      ) => {
        const inputs =
          selectedFilesRef.current.length > 0
            ? selectedFilesRef.current.map((f) => ({
                path: String(f.id),
                title: f.label,
                type: Number(
                  "fileType" in f ? (f.fileType ?? FileType.Unknown) : FileType.Unknown,
                ),
                content: "",
              }))
            : selectedFileInfo
              ? [
                  {
                    path: String(selectedFileInfo.id),
                    title: selectedFileInfo.title,
                    type: Number(selectedFileInfo.fileType ?? FileType.Unknown),
                    content: "",
                  },
                ]
              : [];

        // Optimistic close — the chip will appear once saveFilesMany resolves.
        onClose();

        if (inputs.length === 0) return;

        try {
          await useAttachmentsStore.getState().addAttachmentFile(inputs);
        } catch (e) {
          toastr.error(e as TData);
        }
      },
      [onClose, useAttachmentsStore],
    );

    const getIsDisabled = React.useCallback<
      React.ComponentProps<typeof FilesSelector>["getIsDisabled"]
    >((isFirstLoad, _a, _b, _c, _d, _e, selectedFileInfo) => {
      if (isFirstLoad) return true;
      return selectedFilesRef.current.length === 0 && !selectedFileInfo;
    }, []);

    type SdkFolderType = Parameters<
      typeof FilesSelector
    >[0]["rootFolderType"];
    const sdkUserFolderType = FolderType.USER as unknown as SdkFolderType;

    return (
      <FilesSelector
        isPanelVisible
        openRoot
        isMultiSelect
        withRecentTreeFolder
        withFavoritesTreeFolder
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
  },
);

type PersonalFilesAiAgentProvidersProps = {
  children: React.ReactNode;
};

const PersonalFilesAiAgentProviders = ({
  children,
}: PersonalFilesAiAgentProvidersProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const closePicker = React.useCallback(() => setPickerVisible(false), []);

  const composerActions = React.useMemo<ComposerAction[]>(
    () => [
      {
        id: "add-files-from-docspace",
        text: t("Common:AddFilesFromProduct", {
          productName: getBrandName("ProductName"),
          defaultValue: `Add files from ${getBrandName("ProductName")}`,
        }),
        icon: CatalogDocumentsUrl,
        onClick: () => setPickerVisible(true),
      },
    ],
    [t, i18n.language],
  );

  return (
    <AiAgentProviders
      theme={isBase ? PORTAL_BASE_THEME_ID : PORTAL_DARK_THEME_ID}
      locale={i18n.language}
      composerActions={composerActions}
    >
      {children}
      {pickerVisible ? (
        <DocSpaceFilesAttachDialog onClose={closePicker} />
      ) : null}
    </AiAgentProviders>
  );
};

export default PersonalFilesAiAgentProviders;
