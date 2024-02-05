import React from "react";
import { inject, observer } from "mobx-react";
import { toastr } from "@docspace/shared/components/toast";
import QuickButtons from "../components/QuickButtons";
import copy from "copy-to-clipboard";

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
              : toastr.success(t("Translations:FileLocked"))
          )
          .catch(
            (err) => toastr.error(err),
            this.setState({ isLoading: false })
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
        copy(primaryLink.sharedTo.shareLink);
        item.shared
          ? toastr.success(t("Files:LinkSuccessfullyCopied"))
          : toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
        setShareChanged(true);
      }
    };

    onCopyPrimaryLink = async () => {
      const { t, item, getPrimaryLink } = this.props;
      const primaryLink = await getPrimaryLink(item.id);
      if (primaryLink) {
        copy(primaryLink.sharedTo.shareLink);
        toastr.success(t("Files:LinkSuccessfullyCopied"));
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
    }
  )(observer(WithQuickButtons));
}
