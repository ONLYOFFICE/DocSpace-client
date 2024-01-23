import React from "react";
import { inject, observer } from "mobx-react";
import { ShareAccessRights, FileStatus } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import Badges from "../components/Badges";
import config from "PACKAGE_FILE";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/shared/components/toast";
import { isMobileOnly } from "react-device-detect";

export default function withBadges(WrappedComponent) {
  class WithBadges extends React.Component {
    constructor(props) {
      super(props);

      this.state = { disableBadgeClick: false, disableUnpinClick: false };
    }

    onShowVersionHistory = () => {
      const {
        homepage,
        isTabletView,
        item,
        setIsVerHistoryPanel,
        fetchFileVersions,

        isTrashFolder,
      } = this.props;
      if (isTrashFolder) return;
      fetchFileVersions(item.id + "", item.security);
      setIsVerHistoryPanel(true);
    };

    onBadgeClick = () => {
      if (this.state.disableBadgeClick) return;

      const { item, markAsRead, setNewFilesPanelVisible } = this.props;
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
      } else {
        setNewFilesPanelVisible(true, null, item).then(() => {
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
        t
      );
    };

    setConvertDialogVisible = () => {
      this.props.setConvertItem(this.props.item);
      this.props.setConvertDialogVisible(true);
    };

    onCopyPrimaryLink = async () => {
      if (isMobileOnly) return;

      const { t, item, getPrimaryLink } = this.props;
      const primaryLink = await getPrimaryLink(item.id);
      if (primaryLink) {
        copy(primaryLink.sharedTo.shareLink);
        toastr.success(t("Files:LinkSuccessfullyCopied"));
      }
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
        auth,
        treeFoldersStore,
        filesActionsStore,
        versionHistoryStore,
        dialogsStore,
        filesStore,
        publicRoomStore,
        userStore,
      },
      { item }
    ) => {
      const {
        isRecycleBinFolder,
        isPrivacyFolder,
        isArchiveFolderRoot,
        isArchiveFolder,
        isRecentTab,
      } = treeFoldersStore;
      const { markAsRead, setPinAction, setMuteAction } = filesActionsStore;
      const { isTabletView, isDesktopClient, theme } = auth.settingsStore;
      const { setIsVerHistoryPanel, fetchFileVersions } = versionHistoryStore;
      const {
        setNewFilesPanelVisible,
        setConvertDialogVisible,
        setConvertItem,
      } = dialogsStore;
      const { setIsLoading, isMuteCurrentRoomNotifications, getPrimaryLink } =
        filesStore;
      const { roomType, mute } = item;

      const isRoom = !!roomType;
      const isMutedBadge = isRoom ? mute : isMuteCurrentRoomNotifications;

      return {
        isArchiveFolderRoot,
        theme,
        isAdmin: auth.isAdmin,
        isVisitor: userStore?.user?.isVisitor || !userStore?.user,
        isTrashFolder: isRecycleBinFolder,
        isPrivacyFolder,
        homepage: config.homepage,
        isTabletView,
        setIsVerHistoryPanel,
        fetchFileVersions,
        markAsRead,
        setNewFilesPanelVisible,
        setIsLoading,
        setConvertDialogVisible,
        setConvertItem,
        isDesktopClient,
        setPinAction,
        setMuteAction,
        isMutedBadge,
        getPrimaryLink,
        isArchiveFolder,
        isPublicRoom: publicRoomStore.isPublicRoom,
        isRecentTab,
      };
    }
  )(observer(WithBadges));
}
