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
import { inject, observer } from "mobx-react";
// import {toastr} from "@docspace/shared/components";
import {
  // FileAction,
  FileStatus,
  ShareAccessRights,
} from "@docspace/shared/enums";
// import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getTitleWithoutExtension } from "@docspace/shared/utils";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/shared/constants";
import config from "PACKAGE_FILE";

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
        linkStyles.href = href;
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
        displayFileExtension,
      };
    },
  )(observer(WithContent));
}
