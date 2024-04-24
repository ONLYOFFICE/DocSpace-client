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
import { inject, observer } from "mobx-react";
import { toastr } from "@docspace/shared/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";
import QuickButtons from "../components/QuickButtons";

export default function withQuickButtons(WrappedComponent) {
  class WithQuickButtons extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        isLoading: false,
      };
    }

    onClickLock = () => {
      const { item, lockFileAction, t } = this.props;
      const { locked, id, security } = item;

      if (security?.Lock && !this.state.isLoading) {
        this.setState({ isLoading: true });
        return lockFileAction(id, !locked)
          .then(() =>
            locked
              ? toastr.success(t("Translations:FileUnlocked"))
              : toastr.success(t("Translations:FileLocked")),
          )
          .catch(
            (err) => toastr.error(err),
            this.setState({ isLoading: false }),
          );
      }
      return;
    };

    onClickDownload = () => {
      window.open(this.props.item.viewUrl, "_self");
    };

    onClickFavorite = (showFavorite) => {
      const { t, item, setFavoriteAction } = this.props;

      if (showFavorite) {
        setFavoriteAction("remove", item.id)
          .then(() => toastr.success(t("RemovedFromFavorites")))
          .catch((err) => toastr.error(err));
        return;
      }

      setFavoriteAction("mark", item.id)
        .then(() => toastr.success(t("MarkedAsFavorite")))
        .catch((err) => toastr.error(err));
    };

    onClickShare = async () => {
      const { t, item, getPrimaryFileLink, setShareChanged } = this.props;
      const primaryLink = await getPrimaryFileLink(item.id);
      if (primaryLink) {
        copyShareLink(primaryLink.sharedTo.shareLink);
        item.shared
          ? toastr.success(t("Common:LinkSuccessfullyCopied"))
          : toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
        setShareChanged(true);
      }
    };

    onCopyPrimaryLink = async () => {
      const { t, item, getPrimaryLink } = this.props;
      const primaryLink = await getPrimaryLink(item.id);
      if (primaryLink) {
        copyShareLink(primaryLink.sharedTo.shareLink);
        toastr.success(t("Common:LinkSuccessfullyCopied"));
      }
    };

    render() {
      const { isLoading } = this.state;

      const {
        t,
        theme,
        item,
        isAdmin,
        sectionWidth,
        viewAs,
        folderCategory,
        isPublicRoom,
        isPersonalRoom,
        isArchiveFolder,
      } = this.props;

      const quickButtonsComponent = (
        <QuickButtons
          t={t}
          theme={theme}
          item={item}
          sectionWidth={sectionWidth}
          isAdmin={isAdmin}
          viewAs={viewAs}
          isDisabled={isLoading}
          isPublicRoom={isPublicRoom}
          isPersonalRoom={isPersonalRoom}
          onClickLock={this.onClickLock}
          onClickDownload={this.onClickDownload}
          onClickFavorite={this.onClickFavorite}
          onClickShare={this.onClickShare}
          folderCategory={folderCategory}
          onCopyPrimaryLink={this.onCopyPrimaryLink}
          isArchiveFolder={isArchiveFolder}
        />
      );

      return (
        <WrappedComponent
          quickButtonsComponent={quickButtonsComponent}
          {...this.props}
        />
      );
    }
  }

  return inject(
    ({
      authStore,
      settingsStore,
      filesActionsStore,
      dialogsStore,
      publicRoomStore,
      treeFoldersStore,
      filesStore,
      infoPanelStore,
    }) => {
      const { lockFileAction, setFavoriteAction, onSelectItem } =
        filesActionsStore;
      const {
        isPersonalFolderRoot,
        isArchiveFolderRoot,
        isTrashFolder,
        isPersonalRoom,
        isArchiveFolder,
      } = treeFoldersStore;

      const { setSharingPanelVisible } = dialogsStore;

      const folderCategory =
        isTrashFolder || isArchiveFolderRoot || isPersonalFolderRoot;

      const { isPublicRoom } = publicRoomStore;
      const { getPrimaryFileLink, setShareChanged } = infoPanelStore;

      return {
        theme: settingsStore.theme,
        isAdmin: authStore.isAdmin,
        lockFileAction,
        setFavoriteAction,
        onSelectItem,
        setSharingPanelVisible,
        folderCategory,
        isPublicRoom,
        isPersonalRoom,
        getPrimaryLink: filesStore.getPrimaryLink,
        isArchiveFolder,
        getPrimaryFileLink,
        setShareChanged,
      };
    },
  )(observer(WithQuickButtons));
}
