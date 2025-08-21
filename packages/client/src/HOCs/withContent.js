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
import { inject, observer } from "mobx-react";
// import {toastr} from "@docspace/shared/components";
import {
  // FileAction,
  FileStatus,
  ShareAccessRights,
} from "@docspace/shared/enums";
// import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  getCorrectDate,
  getCookie,
  getTitleWithoutExtension,
} from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";
import config from "PACKAGE_FILE";
// import EditingWrapperComponent from "../components/EditingWrapperComponent";

// import { getDefaultFileName } from "SRC_DIR/helpers/filesUtils";
// import ItemIcon from "../components/ItemIcon";

export default function withContent(WrappedContent) {
  class WithContent extends React.Component {
    constructor(props) {
      super(props);

      const titleWithoutExt = props.titleWithoutExt;

      this.state = { itemTitle: titleWithoutExt };
    }

    componentDidUpdate() {
      const { titleWithoutExt } = this.props;
      const { itemTitle } = this.state;

      if (titleWithoutExt !== itemTitle) {
        this.setState({ itemTitle: titleWithoutExt });
      }
    }

    getStatusByDate = (create) => {
      const { culture, item } = this.props;
      const { created, updated } = item;

      const locale = getCookie(LANGUAGE) || culture;

      const date = create ? created : updated;

      const dateLabel = getCorrectDate(locale, date);

      return dateLabel;
    };

    render() {
      const {
        isDesktop,
        isTrashFolder,
        isArchiveFolder,
        item,
        onFilesClick,
        t,
        viewer,
        titleWithoutExt,
        isPublicRoom,
        publicRoomKey,
        culture,
      } = this.props;
      const locale = getCookie(LANGUAGE) || culture;

      const { access, createdBy, fileStatus, href, lastOpened } = item;

      const updatedDate = this.getStatusByDate(false);
      const createdDate = this.getStatusByDate(true);
      const lastOpenedDate = getCorrectDate(locale, lastOpened);

      const fileOwner =
        createdBy &&
        ((viewer?.id === createdBy.id && t("Common:MeLabel")) ||
          createdBy.displayName);

      const accessToEdit =
        access === ShareAccessRights.FullAccess || // only badges?
        access === ShareAccessRights.None; // TODO: fix access type for owner (now - None)

      const linkStyles = isTrashFolder // || window.innerWidth <= 1024
        ? { noHover: true }
        : { onClick: onFilesClick };

      if (!isDesktop && !isTrashFolder && !isArchiveFolder) {
        linkStyles.href = isPublicRoom
          ? `${href}&share=${publicRoomKey}`
          : href;
      }

      const newItems =
        item.new || (fileStatus & FileStatus.IsNew) === FileStatus.IsNew;
      const showNew = !!newItems;

      return (
        <WrappedContent
          titleWithoutExt={titleWithoutExt}
          updatedDate={updatedDate}
          createdDate={createdDate}
          lastOpenedDate={lastOpenedDate}
          fileOwner={fileOwner}
          accessToEdit={accessToEdit}
          linkStyles={linkStyles}
          newItems={newItems}
          showNew={showNew}
          isTrashFolder={isTrashFolder}
          onFilesClick={onFilesClick}
          isArchiveFolder={isArchiveFolder}
          {...this.props}
        />
      );
    }
  }

  return inject(
    (
      {
        filesStore,
        treeFoldersStore,
        settingsStore,
        dialogsStore,
        uploadDataStore,
        publicRoomStore,
        userStore,
        filesSettingsStore,
      },
      { item },
    ) => {
      const {
        createFile,

        renameFolder,
        setIsLoading,
        updateFile,
        viewAs,
        setIsUpdatingRowItem,
        isUpdatingRowItem,
        passwordEntryProcess,
        addActiveItems,
        setCreatedItem,
      } = filesStore;

      const { isPublicRoom, publicRoomKey } = publicRoomStore;
      const { displayFileExtension } = filesSettingsStore;

      const { clearActiveOperations, fileCopyAs } = uploadDataStore;
      const { isRecycleBinFolder, isPrivacyFolder, isArchiveFolder } =
        treeFoldersStore;

      const { culture, folderFormValidation, isDesktopClient } = settingsStore;

      const {
        setConvertPasswordDialogVisible,
        setConvertItem,
        setFormCreationInfo,
      } = dialogsStore;

      const titleWithoutExt = getTitleWithoutExtension(item, false);

      return {
        createFile,
        culture,

        folderFormValidation,
        homepage: config.homepage,
        isDesktop: isDesktopClient,
        isPrivacy: isPrivacyFolder,
        isTrashFolder: isRecycleBinFolder,
        isArchiveFolder,

        renameFolder,

        setIsLoading,
        updateFile,
        viewAs,
        viewer: userStore.user,
        setConvertPasswordDialogVisible,
        setConvertItem,
        setFormCreationInfo,
        setIsUpdatingRowItem,
        isUpdatingRowItem,
        passwordEntryProcess,
        addActiveItems,
        clearActiveOperations,
        fileCopyAs,

        titleWithoutExt,

        setCreatedItem,
        isPublicRoom,
        publicRoomKey,
        displayFileExtension,
      };
    },
  )(observer(WithContent));
}
