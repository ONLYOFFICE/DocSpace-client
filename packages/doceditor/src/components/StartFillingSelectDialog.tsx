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
import React from "react";
import { useTranslation } from "react-i18next";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import FilesSelectorWrapper from "@docspace/shared/selectors/Files";
import { DeviceType, RoomsType } from "@docspace/shared/enums";
import { useSelectorInfoBar } from "@docspace/shared/hooks/useSelectorInfoBar";
import {
  TInfoBarData,
  TSelectorCancelButton,
} from "@docspace/shared/components/selector/Selector.types";

import { StartFillingSelectorDialogPprops } from "@/types";

function StartFillingSelectorDialog({
  socketHelper,
  fileInfo,
  getIsDisabled,
  isVisible,
  onClose,
  onSubmit,
  filesSettings,
  headerLabel,
}: StartFillingSelectorDialogPprops) {
  const { t } = useTranslation(["Common", "Editor"]);
  const [withInfoBar, onCloseInfoBar] = useSelectorInfoBar();

  const cancelButtonProps: TSelectorCancelButton = {
    withCancelButton: true,
    onCancel: onClose,
    cancelButtonLabel: t("Common:CancelButton"),
    cancelButtonId: "select-file-modal-cancel",
  };
  const infoBarData: TInfoBarData = {
    title: t("Common:SelectorInfoBarTitle"),
    description: t("Common:SelectorInfoBarDescription"),
    icon: InfoIcon,
    onClose: onCloseInfoBar,
  };

  return (
    <FilesSelectorWrapper
      withCreate
      withHeader
      withSearch
      isRoomsOnly
      withBreadCrumbs
      withoutBackButton
      currentFolderId=""
      rootFolderType={fileInfo.rootFolderType}
      createDefineRoomLabel={t("Common:CreateFormFillingRoom")}
      createDefineRoomType={RoomsType.FormRoom}
      isPanelVisible={isVisible}
      socketHelper={socketHelper}
      filesSettings={filesSettings}
      currentDeviceType={DeviceType.desktop}
      socketSubscribers={socketHelper.socketSubscribers}
      headerLabel={headerLabel}
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
