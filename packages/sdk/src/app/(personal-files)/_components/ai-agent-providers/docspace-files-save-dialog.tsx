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

import React from "react";
import { useTranslation } from "react-i18next";

import { useApi } from "@docspace/ui-kit/providers/api";
import FilesSelector from "@docspace/ui-kit/selectors/Files";
import useGetIcon from "@docspace/ui-kit/ai-agent/chat/hooks/useGetIcon";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";
import { FolderType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";

const stripDocxExt = (name: string) => name.replace(/\.docx$/i, "");

type DocSpaceFilesSaveDialogProps = {
  // Markdown body of the message to save, and the library's default file name
  // (e.g. "<title>.docx").
  content: string;
  defaultName: string;
  // Called once the user has saved or cancelled, to close the dialog and
  // resolve the library's awaiting saveAsFile promise.
  onFinish: () => void;
};

// Folder selector for the chat library's message "Save" action. The user picks
// a folder/filename and the message markdown is written to a file there via the
// DocSpace files API. Rendered inside <AiAgentProviders> so ui-kit
// useApi()/useGetIcon() resolve their context.
const DocSpaceFilesSaveDialog = ({
  content,
  defaultName,
  onFinish,
}: DocSpaceFilesSaveDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { currentDeviceType } = useDeviceType();
  const { getIcon } = useGetIcon();
  const { filesApi } = useApi();

  const onSubmit = React.useCallback<
    React.ComponentProps<typeof FilesSelector>["onSubmit"]
  >(
    async (selectedItemId, _folderTitle, _isPublic, _breadCrumbs, fileName) => {
      if (selectedItemId != null) {
        const title = /\.docx$/i.test(fileName) ? fileName : `${fileName}.docx`;
        try {
          const res = await filesApi.createTextFile({
            folderId: Number(selectedItemId),
            createTextOrHtmlFile: { title, content },
          });
          if (res.data.response?.id != null) {
            toastr.success(
              t("Common:MessageSavedToFile", {
                fileName: title,
                defaultValue: "Saved to {{fileName}}",
              }),
            );
          }
        } catch (e) {
          toastr.error(e as TData);
        }
      }
      onFinish();
    },
    [content, filesApi, t, onFinish],
  );

  const getIsDisabled = React.useCallback<
    React.ComponentProps<typeof FilesSelector>["getIsDisabled"]
  >(
    (
      _isFirstLoad,
      _isSelectedParent,
      _selectedItemId,
      selectedItemType,
      _isRoot,
      selectedItemSecurity,
    ) => {
      if (selectedItemType === "rooms" || selectedItemType === "agents")
        return true;
      if (
        selectedItemSecurity &&
        "Create" in selectedItemSecurity &&
        selectedItemSecurity.Create
      )
        return false;
      return true;
    },
    [],
  );

  const sdkUserFolderType = FolderType.USER;

  return (
    <FilesSelector
      isPanelVisible
      openRoot
      isRoomsOnly={false}
      isThirdParty={false}
      withCreate={false}
      withSearch
      withBreadCrumbs
      withoutBackButton
      withCancelButton
      withFooterInput
      withFooterCheckbox={false}
      onCancel={onFinish}
      onSubmit={onSubmit}
      getIcon={getIcon}
      getIsDisabled={getIsDisabled}
      currentFolderId=""
      rootFolderType={sdkUserFolderType}
      disabledItems={[]}
      filterParam="ALL"
      submitButtonLabel={t("Common:SaveButton", { defaultValue: "Save" })}
      cancelButtonLabel={t("Common:CancelButton", { defaultValue: "Cancel" })}
      descriptionText=""
      footerCheckboxLabel=""
      footerInputHeader={t("Common:FileName", { defaultValue: "File name" })}
      currentFooterInputValue={stripDocxExt(defaultName)}
      getFilesArchiveError={() => ""}
      currentDeviceType={currentDeviceType}
    />
  );
};

export default DocSpaceFilesSaveDialog;

