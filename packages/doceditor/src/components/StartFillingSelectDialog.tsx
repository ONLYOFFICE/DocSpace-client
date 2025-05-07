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
import React from "react";
import { useTranslation } from "react-i18next";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files";
import { RoomsType } from "@docspace/shared/enums";
import { useSelectorInfoBar } from "@docspace/shared/hooks/useSelectorInfoBar";
import {
  TInfoBarData,
  TSelectorCancelButton,
} from "@docspace/shared/components/selector/Selector.types";

import { StartFillingSelectorDialogProps } from "@/types";
import useDeviceType from "@/hooks/useDeviceType";

function StartFillingSelectorDialog({
  fileInfo,
  getIsDisabled,
  isVisible,
  onClose,
  onSubmit,
  filesSettings,
  header,
  createDefineRoomType,
}: StartFillingSelectorDialogProps) {
  const { t } = useTranslation(["Common", "Editor"]);
  const [withInfoBar, onCloseInfoBar] = useSelectorInfoBar();
  const { currentDeviceType } = useDeviceType();

  const cancelButtonProps: TSelectorCancelButton = {
    withCancelButton: true,
    onCancel: onClose,
    cancelButtonLabel: t("Common:CancelButton"),
    cancelButtonId: "select-file-modal-cancel",
  };
  const infoBarData: TInfoBarData = {
    title: t("Common:SelectorInfoBarTitle"),
    description:
      createDefineRoomType === RoomsType.FormRoom
        ? t("Common:SelectorInfoBarDescription")
        : t("Common:SelectorInfoBarVDRDescription"),
    icon: InfoIcon,
    onClose: onCloseInfoBar,
  };

  const createDefineRoomLabels: Partial<Record<RoomsType, string>> = {
    [RoomsType.VirtualDataRoom]: t("Common:CreateVirtualDataRoom"),
    [RoomsType.FormRoom]: t("Common:CreateFormFillingRoom"),
  };

  return (
    <FilesSelectorWrapper
      withCreate
      withHeader
      headerProps={header}
      withSearch
      isRoomsOnly
      withBreadCrumbs
      withoutBackButton={false}
      currentFolderId=""
      rootFolderType={fileInfo.rootFolderType}
      createDefineRoomLabel={createDefineRoomLabels[createDefineRoomType]}
      createDefineRoomType={createDefineRoomType}
      isPanelVisible={isVisible}
      filesSettings={filesSettings}
      currentDeviceType={currentDeviceType}
      submitButtonLabel={t("Common:CopyHere")}
      onSubmit={onSubmit}
      getIsDisabled={getIsDisabled}
      {...cancelButtonProps}
      disabledItems={[]}
      descriptionText=""
      footerInputHeader=""
      footerCheckboxLabel=""
      currentFooterInputValue=""
      getFilesArchiveError={() => ""}
      embedded={false}
      isThirdParty={false}
      withFooterCheckbox={false}
      withFooterInput={false}
      withInfoBar={withInfoBar}
      infoBarData={infoBarData}
    />
  );
}

export default StartFillingSelectorDialog;
