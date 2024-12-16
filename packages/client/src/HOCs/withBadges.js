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
import { ShareAccessRights, FileStatus } from "@docspace/shared/enums";

import config from "PACKAGE_FILE";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/shared/components/toast";
import Badges from "../components/Badges";

export default function withBadges(WrappedComponent) {
  class WithBadges extends React.Component {
    constructor(props) {
      super(props);

      this.state = { disableBadgeClick: false, disableUnpinClick: false };
    }

    onShowVersionHistory = () => {
      const {
        item,
        setIsVerHistoryPanel,
        fetchFileVersions,

        isTrashFolder,
      } = this.props;
      if (isTrashFolder) return;
      fetchFileVersions(`${item.id}`, item.security);
      setIsVerHistoryPanel(true);
    };

    onBadgeClick = () => {
      if (this.state.disableBadgeClick) return;

      const { item, markAsRead } = this.props;
      this.setState(() => ({
        disableBadgeClick: true,
      }));

      const enableBadgeClick = () => {
        this.setState({ disableBadgeClick: false });
      };

      if (item.fileExst) {
        markAsRead([], [item.id], item).then(() => {
          enableBadgeClick();
        });
      }
    };

    onUnpinClick = (e) => {
      if (this.state.disableUnpinClick) return;

      this.setState({ disableUnpinClick: true });

      const { t, setPinAction } = this.props;

      const { action, id } = e.target.closest(".is-pinned").dataset;

      if (!action && !id) return;

      setPinAction(action, id, t).then(() => {
        this.setState({ disableUnpinClick: false });
      });
    };

    onUnmuteClick = (e) => {
      const { t, setMuteAction } = this.props;
      const elem = e.target.closest(".is-mute");
      const data = elem.dataset;
      const { id, rootfolderid } = data;

      setMuteAction(
        "unmute",
        { id, rootFolderId: rootfolderid, new: data.new },
        t,
      );
    };

    setConvertDialogVisible = () => {
      this.props.setConvertItem(this.props.item);
      this.props.setConvertDialogVisible(true);
      this.props.setConvertDialogData({
        files: this.props.item,
      });
    };

    onCopyPrimaryLink = async () => {
      const { t, item, getPrimaryLink } = this.props;
      const primaryLink = await getPrimaryLink(item.id);
      if (primaryLink) {
        copyShareLink(primaryLink.sharedTo.shareLink);
        toastr.success(t("Common:LinkSuccessfullyCopied"));
      }
    };

    openLocationFile = () => {
      const { checkAndOpenLocationAction, item } = this.props;

      const { draftLocation, ...options } = item;

      const file = {
        ...options,
        parentId: draftLocation.folderId,
        parentTitle: draftLocation.folderTitle,
        id: draftLocation.fileId,
        title: draftLocation.fileTitle,
      };

      checkAndOpenLocationAction?.(file);
    };

    render() {
      const {
        t,
        theme,
        item,
        isTrashFolder,
        isPrivacyFolder,
        onFilesClick,
        isAdmin,
        isVisitor,
        isDesktopClient,
        viewAs,
        isMutedBadge,
        isArchiveFolderRoot,
        isArchiveFolder,
        isPublicRoom,
        isRecentTab,
      } = this.props;
      const { fileStatus, access, mute } = item;

      const newItems =
        item.new ||
        (!mute && (fileStatus & FileStatus.IsNew) === FileStatus.IsNew);
      const showNew = !!newItems && !isPublicRoom;

      const accessToEdit =
        access === ShareAccessRights.FullAccess ||
        access === ShareAccessRights.None; // TODO: fix access type for owner (now - None)

      const canEditing = access === ShareAccessRights.Editing;

      const badgesComponent = (
        <Badges
          t={t}
          theme={theme}
          item={item}
          isAdmin={isAdmin}
          isVisitor={isVisitor}
          showNew={showNew}
          newItems={newItems}
          isTrashFolder={isTrashFolder}
          isPrivacyFolder={isPrivacyFolder}
          isArchiveFolderRoot={isArchiveFolderRoot}
          isDesktopClient={isDesktopClient}
          accessToEdit={accessToEdit}
          onShowVersionHistory={this.onShowVersionHistory}
          onBadgeClick={this.onBadgeClick}
          onUnpinClick={this.onUnpinClick}
          onUnmuteClick={this.onUnmuteClick}
          openLocationFile={this.openLocationFile}
          setConvertDialogVisible={this.setConvertDialogVisible}
          onFilesClick={onFilesClick}
          viewAs={viewAs}
          isMutedBadge={isMutedBadge}
          onCopyPrimaryLink={this.onCopyPrimaryLink}
          isArchiveFolder={isArchiveFolder}
          isRecentTab={isRecentTab}
          canEditing={canEditing}
        />
      );

      return (
        <WrappedComponent badgesComponent={badgesComponent} {...this.props} />
      );
    }
  }

  return inject(
    (
      {
        authStore,
        treeFoldersStore,
        filesActionsStore,
        versionHistoryStore,
        dialogsStore,
        filesStore,
        publicRoomStore,
        userStore,
        settingsStore,
      },
      { item },
    ) => {
      const {
        isRecycleBinFolder,
        isPrivacyFolder,
        isArchiveFolderRoot,
        isArchiveFolder,
        isRecentTab,
      } = treeFoldersStore;
      const {
        markAsRead,
        setPinAction,
        setMuteAction,
        checkAndOpenLocationAction,
      } = filesActionsStore;
      const { isTabletView, isDesktopClient, theme } = settingsStore;
      const { setIsVerHistoryPanel, fetchFileVersions } = versionHistoryStore;
      const { setConvertDialogVisible, setConvertItem, setConvertDialogData } =
        dialogsStore;
      const { setIsLoading, isMuteCurrentRoomNotifications, getPrimaryLink } =
        filesStore;
      const { roomType, mute } = item;

      const isRoom = !!roomType;
      const isMutedBadge = isRoom ? mute : isMuteCurrentRoomNotifications;

      return {
        isArchiveFolderRoot,
        theme,
        isAdmin: authStore.isAdmin,
        isVisitor: userStore?.user?.isVisitor || !userStore?.user,
        isTrashFolder: isRecycleBinFolder,
        isPrivacyFolder,
        homepage: config.homepage,
        isTabletView,
        setIsVerHistoryPanel,
        fetchFileVersions,
        markAsRead,
        setIsLoading,
        setConvertDialogVisible,
        setConvertDialogData,
        setConvertItem,
        isDesktopClient,
        setPinAction,
        setMuteAction,
        isMutedBadge,
        getPrimaryLink,
        isArchiveFolder,
        isPublicRoom: publicRoomStore.isPublicRoom,
        isRecentTab,
        checkAndOpenLocationAction,
      };
    },
  )(observer(WithBadges));
}
