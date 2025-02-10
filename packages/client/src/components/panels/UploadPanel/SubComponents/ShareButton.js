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

import CatalogSharedReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import React from "react";
import { IconButton } from "@docspace/shared/components/icon-button";
import { inject, observer } from "mobx-react";

const ShareButton = (props) => {
  // console.log("Share button render");
  const { uploadedFile, theme } = props;
  const isShared = uploadedFile[0].fileInfo
    ? uploadedFile[0].fileInfo.shared
    : false;
  let color = theme.filesPanels.upload.shareButton.color;
  if (isShared) color = theme.filesPanels.upload.shareButton.sharedColor;

  const onOpenSharingPanel = () => {
    const { setSharingPanelVisible, selectUploadedFile } = props;

    const file = uploadedFile[0].fileInfo;
    selectUploadedFile([file]);
    setSharingPanelVisible(true);
  };

  return (
    <IconButton
      iconName={CatalogSharedReactSvgUrl}
      className="upload_panel-icon"
      color={color}
      isClickable
      onClick={onOpenSharingPanel}
    />
  );
};

export default inject(
  ({ settingsStore, dialogsStore, uploadDataStore }, { uniqueId }) => {
    const { setSharingPanelVisible } = dialogsStore;
    const { selectUploadedFile, getUploadedFile } = uploadDataStore;

    const uploadedFile = getUploadedFile(uniqueId);

    return {
      uploadedFile,

      theme: settingsStore.theme,

      setSharingPanelVisible,
      selectUploadedFile,
    };
  },
)(observer(ShareButton));
