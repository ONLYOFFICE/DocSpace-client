﻿import HistoryReactSvgUrl from "PUBLIC_DIR/images/history.react.svg?url";
import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";
import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import FileActionsOwnerReactSvgUrl from "PUBLIC_DIR/images/file.actions.owner.react.svg?url";
import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import TickRoundedSvgUrl from "PUBLIC_DIR/images/tick.rounded.svg?url";
import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorites.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/locked.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/duplicate.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FormPlusReactSvgUrl from "PUBLIC_DIR/images/form.plus.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.reat.svg?url";
import MailReactSvgUrl from "PUBLIC_DIR/images/mail.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import PluginActionsSvgUrl from "PUBLIC_DIR/images/plugin.actions.react.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/catalog.rooms.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { getCategoryUrl } from "@docspace/client/src/helpers/utils";

import { makeAutoObservable } from "mobx";
import copy from "copy-to-clipboard";
import saveAs from "file-saver";
import { isMobile, isIOS } from "react-device-detect";
import config from "PACKAGE_FILE";
import { toastr } from "@docspace/shared/components/toast";
import { ShareAccessRights, RoomsType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isDesktop } from "@docspace/shared/utils";
import { Events } from "@docspace/shared/enums";

import { connectedCloudsTypeTitleTranslation } from "@docspace/client/src/helpers/filesUtils";
import { getOAuthToken } from "@docspace/shared/utils/common";
import api from "@docspace/shared/api";
import { FolderType } from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getFileLink } from "@docspace/shared/api/files";

const LOADER_TIMER = 500;
let loadingTime;
let timer;

class ContextOptionsStore {
  settingsStore;
  dialogsStore;
  filesActionsStore;
  filesStore;
  mediaViewerDataStore;
  treeFoldersStore;
  uploadDataStore;
  versionHistoryStore;
  filesSettingsStore;
  selectedFolderStore;
  publicRoomStore;
  oformsStore;
  pluginStore;
  infoPanelStore;
  currentTariffStatusStore;
  userStore;

  linksIsLoading = false;

  constructor(
    settingsStore,
    dialogsStore,
    filesActionsStore,
    filesStore,
    mediaViewerDataStore,
    treeFoldersStore,
    uploadDataStore,
    versionHistoryStore,
    filesSettingsStore,
    selectedFolderStore,
    publicRoomStore,
    oformsStore,
    pluginStore,
    infoPanelStore,
    currentTariffStatusStore,
    userStore
  ) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.dialogsStore = dialogsStore;
    this.filesActionsStore = filesActionsStore;
    this.filesStore = filesStore;
    this.mediaViewerDataStore = mediaViewerDataStore;
    this.treeFoldersStore = treeFoldersStore;
    this.uploadDataStore = uploadDataStore;
    this.versionHistoryStore = versionHistoryStore;
    this.filesSettingsStore = filesSettingsStore;
    this.selectedFolderStore = selectedFolderStore;
    this.publicRoomStore = publicRoomStore;
    this.oformsStore = oformsStore;
    this.pluginStore = pluginStore;
    this.infoPanelStore = infoPanelStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.userStore = userStore;
  }

  onOpenFolder = (item) => {
    this.filesActionsStore.openLocationAction(item);
  };

  onClickLinkFillForm = (item) => {
    return this.gotoDocEditor(false, item);
  };

  onClickReconnectStorage = async (item, t) => {
    const { thirdPartyStore } = this.filesSettingsStore;

    const { openConnectWindow, connectItems } = thirdPartyStore;

    const {
      setRoomCreation,
      setConnectItem,
      setConnectDialogVisible,
      setIsConnectDialogReconnect,
      setSaveAfterReconnectOAuth,
    } = this.dialogsStore;

    setIsConnectDialogReconnect(true);

    setRoomCreation(true);

    const provider = connectItems.find(
      (connectItem) => connectItem.providerName === item.providerKey
    );

    const itemThirdParty = {
      title: connectedCloudsTypeTitleTranslation(provider.providerName, t),
      customer_title: "NOTITLE",
      provider_key: provider.providerName,
      link: provider.oauthHref,
    };

    if (provider.isOauth) {
      let authModal = window.open(
        "",
        t("Common:Authorization"),
        "height=600, width=1020"
      );
      await openConnectWindow(provider.providerName, authModal)
        .then(getOAuthToken)
        .then((token) => {
          authModal.close();
          setConnectItem({
            ...itemThirdParty,
            token,
          });

          setSaveAfterReconnectOAuth(true);
        })
        .catch((err) => {
          if (!err) return;
          toastr.error(err);
        });
    } else {
      setConnectItem(itemThirdParty);
      setConnectDialogVisible(true);
    }
  };

  onClickMakeForm = (item, t) => {
    const { setConvertPasswordDialogVisible, setFormCreationInfo } =
      this.dialogsStore;
    const { title, id, folderId, fileExst } = item;

    const newTitle =
      title.substring(0, title.length - fileExst.length) +
      this.filesSettingsStore.extsWebRestrictedEditing[0];

    this.uploadDataStore.copyAsAction(id, newTitle, folderId).catch((err) => {
      let errorMessage = "";
      if (typeof err === "object") {
        errorMessage =
          err?.response?.data?.error?.message ||
          err?.statusText ||
          err?.message ||
          "";
      } else {
        errorMessage = err;
      }

      if (errorMessage.indexOf("password") == -1) {
        toastr.error(errorMessage, t("Common:Warning"));
        return;
      }

      toastr.error(t("Translations:FileProtected"), t("Common:Warning"));
      setFormCreationInfo({
        newTitle,
        fromExst: fileExst,
        toExst: this.filesSettingsStore.extsWebRestrictedEditing[0],
        fileInfo: item,
      });
      setConvertPasswordDialogVisible(true);
    });
  };

  onClickSubmitToFormGallery = (item) => {
    if (item && !item.exst) {
      const splitTitle = item.title.split(".");
      item.title = splitTitle.slice(0, -1).join(".");
      item.exst = splitTitle.length !== 1 ? `.${splitTitle.at(-1)}` : null;
    }

    this.dialogsStore.setFormItem(item);
    this.dialogsStore.setSubmitToGalleryDialogVisible(true);
  };

  onOpenLocation = (item) => {
    this.filesActionsStore.openLocationAction(item);
  };

  onOwnerChange = () => {
    this.dialogsStore.setChangeOwnerPanelVisible(true);
  };

  onMoveAction = () => {
    const { setIsMobileHidden } = this.infoPanelStore;
    setIsMobileHidden(true);

    this.dialogsStore.setMoveToPanelVisible(true);
  };

  onRestoreAction = () => {
    const { setIsMobileHidden } = this.infoPanelStore;
    setIsMobileHidden(true);
    console.log("Click");
    this.dialogsStore.setRestorePanelVisible(true);
  };

  onCopyAction = () => {
    const { setIsMobileHidden } = this.infoPanelStore;
    setIsMobileHidden(true);

    this.dialogsStore.setCopyPanelVisible(true);
  };

  showVersionHistory = (id, security, requestToken) => {
    const { fetchFileVersions, setIsVerHistoryPanel } =
      this.versionHistoryStore;

    const { setIsMobileHidden } = this.infoPanelStore;

    if (this.treeFoldersStore.isRecycleBinFolder) return;

    fetchFileVersions(id + "", security, requestToken);
    setIsVerHistoryPanel(true);
    setIsMobileHidden(true);
  };

  finalizeVersion = (id) => {
    this.filesActionsStore.finalizeVersionAction(id).catch((err) => {
      toastr.error(err);
    });
  };

  onClickFavorite = (e, id, t) => {
    const data = (e.currentTarget && e.currentTarget.dataset) || e;
    const { action } = data;

    this.filesActionsStore
      .setFavoriteAction(action, id)
      .then(() =>
        action === "mark"
          ? toastr.success(t("MarkedAsFavorite"))
          : toastr.success(t("RemovedFromFavorites"))
      )
      .catch((err) => toastr.error(err));
  };

  lockFile = (item, t) => {
    const { id, locked } = item;
    const { setInfoPanelSelection: setInfoPanelSelection } =
      this.infoPanelStore;

    this.filesActionsStore
      .lockFileAction(id, !locked)
      .then(() =>
        locked
          ? toastr.success(t("Translations:FileUnlocked"))
          : toastr.success(t("Translations:FileLocked"))
      )
      .then(() => setInfoPanelSelection({ ...item, locked: !locked }))
      .catch((err) => {
        toastr.error(err);
      });
  };

  onClickLinkForPortal = (item, t) => {
    const { fileExst, canOpenPlayer, webUrl, id } = item;

    const isFile = !!fileExst;
    copy(
      isFile
        ? canOpenPlayer
          ? `${window.location.href}&preview=${id}`
          : webUrl
        : `${window.location.origin + config.homepage}/filter?folder=${id}` //TODO: Change url by category
    );

    toastr.success(t("Translations:LinkCopySuccess"));
  };

  onCopyLink = async (item, t) => {
    const { shared, navigationPath, canCopyPublicLink } =
      this.selectedFolderStore;

    const { href } = item;
    const sharedItem = navigationPath.find((r) => r.shared);

    const isShared =
      (sharedItem && sharedItem.canCopyPublicLink) ||
      (shared && canCopyPublicLink);

    if (isShared && !item.isFolder) {
      const fileLinkData = await getFileLink(item.id);
      copy(fileLinkData.sharedTo.shareLink);
      return toastr.success(t("Translations:LinkCopySuccess"));
    }

    if (href) {
      copy(href);

      return toastr.success(t("Translations:LinkCopySuccess"));
    }

    const { canConvert } = this.filesSettingsStore;

    const { getItemUrl } = this.filesStore;

    const needConvert = canConvert(item.fileExst);

    const canOpenPlayer =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

    const url = getItemUrl(
      item.id,
      item.isRoom || item.isFolder,
      needConvert,
      canOpenPlayer
    );

    copy(url);

    toastr.success(t("Translations:LinkCopySuccess"));
  };

  onCreateAndCopySharedLink = async (item, t) => {
    const primaryLink = await this.filesStore.getPrimaryLink(item.id);

    if (primaryLink) {
      copy(primaryLink.sharedTo.shareLink);
      item.shared
        ? toastr.success(t("Files:LinkSuccessfullyCopied"))
        : toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));

      this.publicRoomStore.setExternalLink(primaryLink);
    }
  };

  onClickLinkEdit = (item) => {
    const { setConvertItem, setConvertDialogVisible } = this.dialogsStore;
    const canConvert =
      item.viewAccessibility?.MustConvert && item.security?.Convert;

    if (canConvert) {
      setConvertItem({ ...item, isOpen: true });
      setConvertDialogVisible(true);
    } else {
      this.gotoDocEditor(false, item);
    }
  };

  onPreviewClick = (item) => {
    this.gotoDocEditor(true, item);
  };

  gotoDocEditor = (preview = false, item) => {
    const { isDesktopClient } = this.settingsStore;

    const { id, providerKey, fileExst } = item;

    const urlFormation = preview
      ? combineUrl(
          window.DocSpaceConfig?.proxy?.url,
          config.homepage,
          `/doceditor?fileId=${encodeURIComponent(id)}&action=view`
        )
      : null;

    let tab =
      !isDesktopClient &&
      window.DocSpaceConfig?.editor?.openOnNewPage &&
      fileExst
        ? window.open(
            combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              config.homepage,
              `/doceditor`
            ),
            "_blank"
          )
        : null;

    this.filesStore.openDocEditor(id, providerKey, tab, urlFormation, preview);
  };

  isPwa = () => {
    return ["fullscreen", "standalone", "minimal-ui"].some(
      (displayMode) =>
        window.matchMedia("(display-mode: " + displayMode + ")").matches
    );
  };

  onClickDownload = (item, t) => {
    const { fileExst, contentLength, viewUrl } = item;
    const isFile = !!fileExst && contentLength;

    if (isIOS && this.isPwa()) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", viewUrl);
      xhr.responseType = "blob";

      xhr.onload = () => {
        saveAs(xhr.response, item.title);
      };

      xhr.onerror = () => {
        console.error("download failed", viewUrl);
      };

      xhr.send();
      return;
    }

    isFile
      ? window.open(viewUrl, "_self")
      : this.filesActionsStore
          .downloadAction(t("Translations:ArchivingData"), item)
          .catch((err) => toastr.error(err));
  };

  onClickDownloadAs = () => {
    this.dialogsStore.setDownloadDialogVisible(true);
  };

  onClickCreateRoom = (item) => {
    this.filesActionsStore.setProcessCreatingRoomFromData(true);
    const event = new Event(Events.ROOM_CREATE);
    if (item && item.isFolder) {
      event.title = item.title;
    }
    window.dispatchEvent(event);
  };

  onDuplicate = (item, t) => {
    this.filesActionsStore
      .duplicateAction(item, t("Common:CopyOperation"))
      .catch((err) => toastr.error(err));
  };

  onClickRename = (item) => {
    const event = new Event(Events.RENAME);

    event.item = item;

    window.dispatchEvent(event);
  };

  onChangeThirdPartyInfo = (providerKey) => {
    this.filesActionsStore.setThirdpartyInfo(providerKey);
  };

  onMediaFileClick = (fileId, item) => {
    const itemId = typeof fileId !== "object" ? fileId : item.id;
    this.mediaViewerDataStore.setMediaViewerData({ visible: true, id: itemId });
    this.mediaViewerDataStore.changeUrl(itemId);
  };

  onClickDeleteSelectedFolder = (t, isRoom) => {
    const { setIsFolderActions, setDeleteDialogVisible, setIsRoomDelete } =
      this.dialogsStore;
    const { confirmDelete } = this.filesSettingsStore;
    const { deleteAction, deleteRoomsAction } = this.filesActionsStore;
    const { id: selectedFolderId, getSelectedFolder } =
      this.selectedFolderStore;
    const { isThirdPartySelection, getFolderInfo, setBufferSelection } =
      this.filesStore;

    setIsFolderActions(true);

    if (confirmDelete || isThirdPartySelection) {
      getFolderInfo(selectedFolderId).then((data) => {
        setBufferSelection(data);
        setIsRoomDelete(isRoom);
        setDeleteDialogVisible(true);
      });

      return;
    }

    let translations;

    if (isRoom) {
      translations = {
        successRemoveRoom: t("Files:RoomRemoved"),
        successRemoveRooms: t("Files:RoomsRemoved"),
      };

      deleteRoomsAction([selectedFolderId], translations).catch((err) =>
        toastr.error(err)
      );
    } else {
      translations = {
        deleteOperation: t("Translations:DeleteOperation"),
        deleteFromTrash: t("Translations:DeleteFromTrash"),
        deleteSelectedElem: t("Translations:DeleteSelectedElem"),
        FolderRemoved: t("Files:FolderRemoved"),
      };

      const selectedFolder = getSelectedFolder();

      deleteAction(translations, [selectedFolder], true).catch((err) =>
        toastr.error(err)
      );
    }
  };

  onClickDelete = (item, t) => {
    const { id, title, providerKey, rootFolderId, isFolder, isRoom } = item;

    const { setRemoveItem, setDeleteThirdPartyDialogVisible } =
      this.dialogsStore;

    if (id === this.selectedFolderStore.id && isFolder) {
      this.onClickDeleteSelectedFolder(t, isRoom);

      return;
    }

    const isRootThirdPartyFolder = providerKey && id === rootFolderId;

    if (isRootThirdPartyFolder) {
      const splitItem = id.split("-");
      setRemoveItem({ id: splitItem[splitItem.length - 1], title });
      setDeleteThirdPartyDialogVisible(true);
      return;
    }

    const translations = {
      deleteOperation: t("Translations:DeleteOperation"),
      successRemoveFile: t("Files:FileRemoved"),
      successRemoveFolder: t("Files:FolderRemoved"),
      successRemoveRoom: t("Files:RoomRemoved"),
      successRemoveRooms: t("Files:RoomsRemoved"),
    };

    this.filesActionsStore.deleteItemAction(
      id,
      translations,
      !isFolder,
      providerKey,
      isRoom
    );
  };

  onClickShare = (item) => {
    const { openShareTab } = this.infoPanelStore;
    const { setShareFolderDialogVisible } = this.dialogsStore;

    if (item.isFolder) {
      setShareFolderDialogVisible(true);
    } else {
      openShareTab();
    }
  };

  onClickMarkRead = (item) => {
    const { markAsRead } = this.filesActionsStore;

    item.fileExst
      ? markAsRead([], [item.id], item)
      : markAsRead([item.id], [], item);
  };

  onClickUnsubscribe = () => {
    const { setDeleteDialogVisible, setUnsubscribe } = this.dialogsStore;

    setUnsubscribe(true);
    setDeleteDialogVisible(true);
  };

  filterModel = (model, filter) => {
    let options = [];
    let index = 0;
    const last = model.length;

    for (index; index < last; index++) {
      if (filter.includes(model[index].key)) {
        options[index] = model[index];
        if (model[index].items) {
          options[index].items = model[index].items.filter((item) =>
            filter.includes(item.key)
          );

          if (options[index].items.length === 1) {
            options[index] = options[index].items[0];
          }
        }
      }
    }

    return options.filter((o) => !!o);
  };

  onShowInfoPanel = (item, view) => {
    const { setIsVisible, setView } = this.infoPanelStore;

    setIsVisible(true);
    view && setView(view);
  };

  onClickEditRoom = (item) => {
    const event = new Event(Events.ROOM_EDIT);
    event.item = item;
    window.dispatchEvent(event);
  };

  // onLoadLinks = async (t, item) => {
  //   const promise = new Promise(async (resolve, reject) => {
  //     let linksArray = [];

  //     this.setLoaderTimer(true);
  //     try {
  //       const links = await this.publicRoomStore.fetchExternalLinks(item.id);

  //       for (let link of links) {
  //         const { id, title, shareLink, disabled, isExpired } = link.sharedTo;

  //         if (!disabled && !isExpired) {
  //           linksArray.push({
  //             icon: InvitationLinkReactSvgUrl,
  //             id,
  //             key: `external-link_${id}`,
  //             label: title,
  //             onClick: () => {
  //               copy(shareLink);
  //               toastr.success(t("Translations:LinkCopySuccess"));
  //             },
  //           });
  //         }
  //       }

  //       if (!linksArray.length) {
  //         linksArray = [
  //           {
  //             id: "no-external-links-option",
  //             key: "no-external-links",
  //             label: !links.length
  //               ? t("Files:NoExternalLinks")
  //               : t("Files:AllLinksAreDisabled"),
  //             disableColor: true,
  //           },
  //           !isMobile && {
  //             key: "separator0",
  //             isSeparator: true,
  //           },
  //           {
  //             icon: SettingsReactSvgUrl,
  //             id: "manage-option",
  //             key: "manage-links",
  //             label: t("Notifications:ManageNotifications"),
  //             onClick: () => this.onShowInfoPanel(item, "info_members"),
  //           },
  //         ];
  //       }

  //       this.setLoaderTimer(false, () => resolve(linksArray));
  //     } catch (error) {
  //       toastr.error(error);
  //       this.setLoaderTimer(false);
  //       return reject(linksArray);
  //     }
  //   });

  //   return promise;
  // };

  onLoadPlugins = (item) => {
    const { contextOptions } = item;
    const { enablePlugins } = this.settingsStore;

    const pluginItems = [];
    this.setLoaderTimer(true);

    if (enablePlugins && this.pluginStore.contextMenuItemsList) {
      this.pluginStore.contextMenuItemsList.forEach((option) => {
        if (contextOptions.includes(option.key)) {
          const value = option.value;

          const onClick = async () => {
            if (value.withActiveItem) {
              const { setActiveFiles } = this.filesStore;

              setActiveFiles([item.id]);

              await value.onClick(item.id);

              setActiveFiles([]);
            } else {
              value.onClick(item.id);
            }
          };

          if (value.fileExt) {
            if (value.fileExt.includes(item.fileExst)) {
              pluginItems.push({
                key: option.key,
                label: value.label,
                icon: value.icon,
                onClick,
              });
            }
          } else {
            pluginItems.push({
              key: option.key,
              label: value.label,
              icon: value.icon,
              onClick,
            });
          }
        }
      });
    }

    this.setLoaderTimer(false);

    return pluginItems;
  };

  onClickInviteUsers = (e, roomType) => {
    const data = (e.currentTarget && e.currentTarget.dataset) || e;

    const { action } = data;

    const { isGracePeriod } = this.currentTariffStatusStore;

    if (isGracePeriod) {
      this.dialogsStore.setInviteUsersWarningDialogVisible(true);
    } else {
      this.dialogsStore.setInvitePanelOptions({
        visible: true,
        roomId: action ? action : e,
        hideSelector: false,
        defaultAccess:
          roomType === RoomsType.PublicRoom
            ? ShareAccessRights.RoomManager
            : ShareAccessRights.ReadOnly,
      });
    }
  };

  onClickPin = (e, id, t) => {
    const data = (e.currentTarget && e.currentTarget.dataset) || e;
    const { action } = data;

    this.filesActionsStore.setPinAction(action, id, t);
  };

  onClickArchive = (e) => {
    const data = (e.currentTarget && e.currentTarget.dataset) || e;
    const { action } = data;
    const { isGracePeriod } = this.currentTariffStatusStore;
    const {
      setArchiveDialogVisible,
      setRestoreRoomDialogVisible,
      setInviteUsersWarningDialogVisible,
    } = this.dialogsStore;

    if (action === "unarchive" && isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
      return;
    }

    if (action === "archive") {
      setArchiveDialogVisible(true);
    } else {
      setRestoreRoomDialogVisible(true);
    }
  };

  onLeaveRoom = () => {
    this.dialogsStore.setLeaveRoomDialogVisible(true);
  };

  onSelect = (item) => {
    const { onSelectItem } = this.filesActionsStore;

    onSelectItem({ id: item.id, isFolder: item.isFolder }, true, false);
  };

  onShowEditingToast = (t) => {
    toastr.error(t("Files:DocumentEdited"));
  };

  onClickMute = (e, item, t) => {
    const data = (e.currentTarget && e.currentTarget.dataset) || e;
    const { action } = data;

    this.filesActionsStore.setMuteAction(action, item, t);
  };

  onClickRemoveFromRecent = (item) => {
    this.filesActionsStore.removeFilesFromRecent([item.id]);
  };

  setLoaderTimer = (isLoading, cb) => {
    if (isLoading) {
      loadingTime = new Date();

      return (timer = setTimeout(() => {
        this.linksIsLoading = true;
      }, LOADER_TIMER));
    } else {
      if (loadingTime) {
        const currentDate = new Date();

        let ms = Math.abs(loadingTime.getTime() - currentDate.getTime());

        if (timer) {
          let ms = Math.abs(ms - LOADER_TIMER);

          clearTimeout(timer);
          timer = null;
        }

        if (ms < LOADER_TIMER) {
          return setTimeout(() => {
            this.linksIsLoading = true;
            loadingTime = null;
            cb && cb();
          }, LOADER_TIMER - ms);
        }
      }

      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      loadingTime = null;
      this.linksIsLoading = false;
      cb && cb();
    }
  };

  onCreateOform = (navigate) => {
    this.infoPanelStore.setIsVisible(false);
    const filesFilter = FilesFilter.getDefault();
    filesFilter.folder = this.oformsStore.oformFromFolderId;
    const filterUrlParams = filesFilter.toUrlParams();
    const url = getCategoryUrl(
      this.filesStore.categoryType,
      filterUrlParams.folder
    );

    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `${url}?${filterUrlParams}`
      )
    );
  };

  onShowOformTemplateInfo = (item) => {
    this.infoPanelStore.setIsVisible(true);
    this.oformsStore.setGallerySelected(item);
  };

  onSuggestOformChanges = (item) => {
    const formTitle = item.attributes ? item.attributes.name_form : item.title;

    window.location = `mailto:marketing@onlyoffice.com
    ?subject=Suggesting changes for ${formTitle}
    &body=Suggesting changes for ${formTitle}.
  `;
  };

  getFormGalleryContextOptions = (item, t, navigate) => {
    return [
      {
        key: "create",
        label: t("Common:Create"),
        onClick: () => this.onCreateOform(navigate),
      },
      {
        key: "template-info",
        label: t("FormGallery:TemplateInfo"),
        onClick: () => this.onShowOformTemplateInfo(item),
      },
      {
        key: "separator",
        isSeparator: true,
      },
      {
        key: "suggest-changes",
        label: t("FormGallery:SuggestChanges"),
        onClick: () => this.onSuggestOformChanges(item),
      },
    ];
  };

  getRoomsRootContextOptions = (item, t) => {
    const { id, rootFolderId } = this.selectedFolderStore;
    const isRootRoom = item.isRoom && rootFolderId === id;

    if (!isRootRoom) return { pinOptions: [], muteOptions: [] };

    const pinOptions = [
      {
        id: "option_pin-room",
        key: "pin-room",
        label: t("PinToTop"),
        icon: PinReactSvgUrl,
        onClick: (e) => this.onClickPin(e, item.id, t),
        disabled: this.publicRoomStore.isPublicRoom,
        "data-action": "pin",
        action: "pin",
      },
      {
        id: "option_unpin-room",
        key: "unpin-room",
        label: t("Unpin"),
        icon: UnpinReactSvgUrl,
        onClick: (e) => this.onClickPin(e, item.id, t),
        disabled: this.publicRoomStore.isPublicRoom,
        "data-action": "unpin",
        action: "unpin",
      },
    ];

    const muteOptions = [
      {
        id: "option_unmute-room",
        key: "unmute-room",
        label: t("EnableNotifications"),
        icon: UnmuteReactSvgUrl,
        onClick: (e) => this.onClickMute(e, item, t),
        disabled: !item.inRoom || this.publicRoomStore.isPublicRoom,
        "data-action": "unmute",
        action: "unmute",
      },
      {
        id: "option_mute-room",
        key: "mute-room",
        label: t("DisableNotifications"),
        icon: MuteReactSvgUrl,
        onClick: (e) => this.onClickMute(e, item, t),
        disabled: !item.inRoom || this.publicRoomStore.isPublicRoom,
        "data-action": "mute",
        action: "mute",
      },
    ];

    return { pinOptions, muteOptions };
  };

  getFilesContextOptions = (item, t, isInfoPanel) => {
    const { contextOptions, isEditing } = item;

    const isRootThirdPartyFolder =
      item.providerKey && item.id === item.rootFolderId;

    const isShareable = this.treeFoldersStore.isPersonalRoom
      ? item.canShare || item.isFolder
      : false;

    const isMedia =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

    const hasInfoPanel = contextOptions.includes("show-info");

    //const emailSendIsDisabled = true;
    const showSeparator0 =
      (hasInfoPanel || !isMedia) && !this.publicRoomStore.isPublicRoom; // || !emailSendIsDisabled;

    const separator0 = showSeparator0
      ? {
          key: "separator0",
          isSeparator: true,
        }
      : false;

    const onlyShowVersionHistory =
      !contextOptions.includes("finalize-version") &&
      contextOptions.includes("show-version-history");

    const versionActions = isDesktop()
      ? onlyShowVersionHistory
        ? [
            {
              id: "option_show-version-history",
              key: "show-version-history",
              label: t("ShowVersionHistory"),
              icon: HistoryReactSvgUrl,
              onClick: () =>
                this.showVersionHistory(
                  item.id,
                  item.security,
                  item?.requestToken
                ),
              disabled: false,
            },
          ]
        : [
            {
              id: "option_version",
              key: "version",
              label: t("VersionHistory"),
              icon: HistoryFinalizedReactSvgUrl,
              items: [
                {
                  id: "option_finalize-version",
                  key: "finalize-version",
                  label: t("FinalizeVersion"),
                  icon: HistoryFinalizedReactSvgUrl,
                  onClick: () =>
                    isEditing
                      ? this.onShowEditingToast(t)
                      : this.finalizeVersion(item.id, item.security),
                  disabled: false,
                },
                {
                  id: "option_version-history",
                  key: "show-version-history",
                  label: t("ShowVersionHistory"),
                  icon: HistoryReactSvgUrl,
                  onClick: () =>
                    this.showVersionHistory(
                      item.id,
                      item.security,
                      item?.requestToken
                    ),
                  disabled: false,
                },
              ],
            },
          ]
      : [
          {
            id: "option_finalize-version",
            key: "finalize-version",
            label: t("FinalizeVersion"),
            icon: HistoryFinalizedReactSvgUrl,
            onClick: () =>
              isEditing
                ? this.onShowEditingToast(t)
                : this.finalizeVersion(item.id),
            disabled: false,
          },
          {
            id: "option_version-history",
            key: "show-version-history",
            label: t("ShowVersionHistory"),
            icon: HistoryReactSvgUrl,
            onClick: () =>
              this.showVersionHistory(
                item.id,
                item.security,
                item?.requestToken
              ),
            disabled: false,
          },
        ];
    const moveActions =
      isDesktop() && !isInfoPanel
        ? [
            {
              id: "option_move-or-copy",
              key: "move",
              label: t("MoveOrCopy"),
              icon: CopyReactSvgUrl,
              items: [
                {
                  id: "option_move-to",
                  key: "move-to",
                  label: t("Common:MoveTo"),
                  icon: MoveReactSvgUrl,
                  onClick: isEditing
                    ? () => this.onShowEditingToast(t)
                    : this.onMoveAction,
                  disabled: false,
                },
                {
                  id: "option_copy-to",
                  key: "copy-to",
                  label: t("Common:Copy"),
                  icon: CopyReactSvgUrl,
                  onClick: this.onCopyAction,
                  disabled: false,
                },
                {
                  id: "option_create-copy",
                  key: "copy",
                  label: t("Common:Duplicate"),
                  icon: DuplicateReactSvgUrl,
                  onClick: () => this.onDuplicate(item, t),
                  disabled: false,
                },
              ],
            },
          ]
        : [
            {
              id: "option_move-to",
              key: "move-to",
              label: t("Common:MoveTo"),
              icon: MoveReactSvgUrl,
              onClick: isEditing
                ? () => this.onShowEditingToast(t)
                : this.onMoveAction,
              disabled: false,
            },
            {
              id: "option_copy-to",
              key: "copy-to",
              label: t("Common:Copy"),
              icon: CopyReactSvgUrl,
              onClick: this.onCopyAction,
              disabled: false,
            },
            {
              id: "option_create-copy",
              key: "copy",
              label: t("Common:Duplicate"),
              icon: DuplicateReactSvgUrl,
              onClick: () => this.onDuplicate(item, t),
              disabled: false,
            },
          ];

    const { pinOptions, muteOptions } = this.getRoomsRootContextOptions(
      item,
      t
    );

    let withOpen = item.id !== this.selectedFolderStore.id;
    const isPublicRoomType =
      item.roomType === RoomsType.PublicRoom ||
      item.roomType === RoomsType.CustomRoom;

    if (item.isRoom && withOpen) {
      withOpen =
        this.selectedFolderStore.navigationPath.findIndex(
          (f) => f.id === item.id
        ) === -1;
    }

    const isArchive = item.rootFolderType === FolderType.Archive;

    const optionsModel = [
      {
        id: "option_select",
        key: "select",
        label: t("Common:SelectAction"),
        icon: CheckBoxReactSvgUrl,
        onClick: () => this.onSelect(item),
        disabled: false,
      },
      withOpen && {
        id: "option_open",
        key: "open",
        label: t("Open"),
        icon: FolderReactSvgUrl,
        onClick: () => this.onOpenFolder(item),
        disabled: false,
      },
      {
        id: "option_fill-form",
        key: "fill-form",
        label: t("Common:FillFormButton"),
        icon: FormFillRectSvgUrl,
        onClick: () => this.onClickLinkFillForm(item),
        disabled: false,
      },
      {
        id: "option_edit",
        key: "edit",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: () => this.onClickLinkEdit(item),
        disabled: false,
      },
      {
        id: "option_preview",
        key: "preview",
        label: t("Common:Preview"),
        icon: EyeReactSvgUrl,
        onClick: () => this.onPreviewClick(item),
        disabled: false,
      },
      {
        id: "option_view",
        key: "view",
        label: t("Common:View"),
        icon: EyeReactSvgUrl,
        onClick: (fileId) => this.onMediaFileClick(fileId, item),
        disabled: false,
      },
      {
        id: "option_pdf-view",
        key: "pdf-view",
        label: "Pdf viewer",
        icon: EyeReactSvgUrl,
        onClick: (fileId) => this.onMediaFileClick(fileId, item),
        disabled: false,
      },
      {
        id: "option_make-form",
        key: "make-form",
        label: t("Common:MakeForm"),
        icon: FormPlusReactSvgUrl,
        onClick: () => this.onClickMakeForm(item, t),
        disabled: false,
      },
      separator0,
      {
        id: "option_submit-to-gallery",
        key: "submit-to-gallery",
        label: t("Common:SubmitToFormGallery"),
        icon: FormFileReactSvgUrl,
        onClick: () => this.onClickSubmitToFormGallery(item),
        isOutsideLink: true,
        disabled: !item.security?.SubmitToFormGallery,
      },
      {
        key: "separator-SubmitToGallery",
        isSeparator: true,
      },
      {
        id: "option_reconnect-storage",
        key: "reconnect-storage",
        label: t("Common:ReconnectStorage"),
        icon: ReconnectSvgUrl,
        onClick: () => this.onClickReconnectStorage(item, t),
        disabled: false,
      },
      {
        id: "option_edit-room",
        key: "edit-room",
        label: t("EditRoom"),
        icon: SettingsReactSvgUrl,
        onClick: () => this.onClickEditRoom(item),
        disabled: false,
      },
      {
        id: "option_invite-users-to-room",
        key: "invite-users-to-room",
        label: t("Common:InviteUsers"),
        icon: PersonReactSvgUrl,
        onClick: (e) => this.onClickInviteUsers(e, item.roomType),
        disabled: false,
        action: item.id,
      },
      {
        id: "option_sharing-settings",
        key: "sharing-settings",
        label: t("Files:Share"),
        icon: ShareReactSvgUrl,
        onClick: () => this.onClickShare(item),
        disabled: !isShareable,
      },
      ...versionActions,
      {
        id: "option_link-for-room-members",
        key: "link-for-room-members",
        label: t("Files:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => this.onCopyLink(item, t),
        disabled:
          (isPublicRoomType && item.canCopyPublicLink && !isArchive) ||
          this.publicRoomStore.isPublicRoom,
      },
      {
        id: "option_copy-external-link",
        key: "external-link",
        label: t("Files:CopySharedLink"),
        icon: TabletLinkReactSvgUrl,
        disabled:
          this.publicRoomStore.isPublicRoom ||
          isArchive ||
          !item.canCopyPublicLink ||
          !isPublicRoomType,
        onClick: () => this.onCreateAndCopySharedLink(item, t),
        // onLoad: () => this.onLoadLinks(t, item),
      },
      {
        id: "option_room-info",
        key: "room-info",
        label: t("Common:Info"),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => this.onShowInfoPanel(item),
        disabled: this.publicRoomStore.isPublicRoom,
      },
      ...pinOptions,
      ...muteOptions,
      {
        id: "option_owner-change",
        key: "owner-change",
        label: t("Translations:OwnerChange"),
        icon: FileActionsOwnerReactSvgUrl,
        onClick: this.onOwnerChange,
        disabled: false,
      },
      {
        id: "option_link-for-portal-users",
        key: "link-for-portal-users",
        label: t("LinkForPortalUsers"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => this.onClickLinkForPortal(item, t),
        disabled: false,
      },
      // {
      //   id: "option_send-by-email",
      //   key: "send-by-email",
      //   label: t("SendByEmail"),
      //   icon: MailReactSvgUrl,
      //   disabled: emailSendIsDisabled,
      // },
      {
        id: "option_show-info",
        key: "show-info",
        label: t("Common:Info"),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => this.onShowInfoPanel(item),
        disabled: this.publicRoomStore.isPublicRoom,
      },
      {
        id: "option_block-unblock-version",
        key: "block-unblock-version",
        label: t("UnblockVersion"),
        icon: LockedReactSvgUrl,
        onClick: () => this.lockFile(item, t),
        disabled: false,
      },
      !this.publicRoomStore.isPublicRoom && {
        key: "separator1",
        isSeparator: true,
      },
      {
        id: "option_open-location",
        key: "open-location",
        label: t("OpenLocation"),
        icon: FolderLocationReactSvgUrl,
        onClick: () => this.onOpenLocation(item),
        disabled: false,
      },
      {
        id: "option_mark-read",
        key: "mark-read",
        label: t("MarkRead"),
        icon: TickRoundedSvgUrl,
        onClick: () => this.onClickMarkRead(item),
        disabled: false,
      },
      {
        id: "option_mark-as-favorite",
        key: "mark-as-favorite",
        label: t("MarkAsFavorite"),
        icon: FavoritesReactSvgUrl,
        onClick: (e) => this.onClickFavorite(e, item.id, t),
        disabled: false,
        "data-action": "mark",
        action: "mark",
      },
      {
        id: "option_remove-from-favorites",
        key: "remove-from-favorites",
        label: t("RemoveFromFavorites"),
        icon: FavoritesReactSvgUrl,
        onClick: (e) => this.onClickFavorite(e, item.id, t),
        disabled: false,
        "data-action": "remove",
        action: "remove",
      },
      {
        id: "option_create_room",
        key: "create-room",
        label: t("Files:CreateRoom"),
        icon: CatalogRoomsReactSvgUrl,
        onClick: () => this.onClickCreateRoom(item),
        disabled: this.selectedFolderStore.rootFolderType !== FolderType.USER,
      },
      {
        id: "option_download",
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => this.onClickDownload(item, t),
        disabled: !item.security?.Download,
      },
      {
        id: "option_download-as",
        key: "download-as",
        label: t("Translations:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: this.onClickDownloadAs,
        disabled: !item.security?.Download,
      },
      ...moveActions,
      {
        id: "option_restore",
        key: "restore",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: this.onRestoreAction,
        disabled: false,
      },
      {
        id: "option_rename",
        key: "rename",
        label: t("Common:Rename"),
        icon: RenameReactSvgUrl,
        onClick: () => this.onClickRename(item),
        disabled: false,
      },
      {
        key: "separator3",
        isSeparator: true,
      },
      {
        id: "option_unsubscribe",
        key: "unsubscribe",
        label: t("RemoveFromList"),
        icon: RemoveSvgUrl,
        onClick: this.onClickUnsubscribe,
        disabled: false,
      },
      {
        id: "option_change-thirdparty-info",
        key: "change-thirdparty-info",
        label: t("Translations:ThirdPartyInfo"),
        icon: AccessEditReactSvgUrl,
        onClick: () => this.onChangeThirdPartyInfo(item.providerKey),
        disabled: false,
      },
      {
        id: "option_archive-room",
        key: "archive-room",
        label: t("MoveToArchive"),
        icon: RoomArchiveSvgUrl,
        onClick: (e) => this.onClickArchive(e),
        disabled: false,
        "data-action": "archive",
        action: "archive",
      },
      {
        id: "option_leave-room",
        key: "leave-room",
        label: t("LeaveTheRoom"),
        icon: LeaveRoomSvgUrl,
        onClick: this.onLeaveRoom,
        disabled:
          isArchive || !item.inRoom || this.publicRoomStore.isPublicRoom,
      },
      {
        id: "option_unarchive-room",
        key: "unarchive-room",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: (e) => this.onClickArchive(e),
        disabled: false,
        "data-action": "unarchive",
        action: "unarchive",
      },
      {
        id: "option_delete",
        key: "delete",
        label: isRootThirdPartyFolder
          ? t("Common:Disconnect")
          : t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () =>
          isEditing ? this.onShowEditingToast(t) : this.onClickDelete(item, t),
        disabled: false,
      },
      {
        id: "option_remove-from-recent",
        key: "remove-from-recent",
        label: t("RemoveFromList"),
        icon: RemoveOutlineSvgUrl,
        onClick: () => this.onClickRemoveFromRecent(item),
        disabled: !this.treeFoldersStore.isRecentTab,
      },
    ];

    const options = this.filterModel(optionsModel, contextOptions);

    const pluginItems = this.onLoadPlugins(item);

    if (pluginItems.length > 0) {
      options.splice(1, 0, {
        id: "option_plugin-actions",
        key: "plugin_actions",
        label: t("Common:Actions"),
        icon: PluginActionsSvgUrl,
        disabled: false,

        onLoad: () => this.onLoadPlugins(item),
      });
    }

    const { isCollaborator } = this.userStore?.user || {
      isCollaborator: false,
    };

    const newOptions = options.filter(
      (option, index) =>
        !(index === 0 && option.key === "separator1") &&
        !(isCollaborator && option.key === "create-room")
    );

    return newOptions;
  };

  getGroupContextOptions = (t) => {
    const { personal } = this.settingsStore;
    const { selection, allFilesIsEditing } = this.filesStore;
    const { setDeleteDialogVisible } = this.dialogsStore;
    const { isRecycleBinFolder, isRoomsFolder, isArchiveFolder } =
      this.treeFoldersStore;

    const { pinRooms, unpinRooms, deleteRooms } = this.filesActionsStore;

    if (isRoomsFolder || isArchiveFolder) {
      const isPinOption = selection.filter((item) => !item.pinned).length > 0;

      let canDelete;
      if (isRoomsFolder) {
        canDelete = selection.every((k) => k.contextOptions.includes("delete"));
      } else if (isArchiveFolder) {
        canDelete = selection.some((k) => k.contextOptions.includes("delete"));
      }

      const canArchiveRoom = selection.every((k) =>
        k.contextOptions.includes("archive-room")
      );

      const canRestoreRoom = selection.some((k) =>
        k.contextOptions.includes("unarchive-room")
      );

      let archiveOptions;

      const pinOption = isPinOption
        ? {
            key: "pin-room",
            label: t("PinToTop"),
            icon: PinReactSvgUrl,
            onClick: () => pinRooms(t),
            disabled: false,
          }
        : {
            key: "unpin-room",
            label: t("Unpin"),
            icon: UnpinReactSvgUrl,
            onClick: () => unpinRooms(t),
            disabled: false,
          };

      if (canArchiveRoom) {
        archiveOptions = {
          key: "archive-room",
          label: t("MoveToArchive"),
          icon: RoomArchiveSvgUrl,
          onClick: (e) => this.onClickArchive(e),
          disabled: false,
          "data-action": "archive",
          action: "archive",
        };
      }
      if (canRestoreRoom) {
        archiveOptions = {
          key: "unarchive-room",
          label: t("Common:Restore"),
          icon: MoveReactSvgUrl,
          onClick: (e) => this.onClickArchive(e),
          disabled: false,
          "data-action": "unarchive",
          action: "unarchive",
        };
      }

      const options = [];

      if (!isArchiveFolder) {
        options.push(pinOption);
      }

      if ((canArchiveRoom || canDelete) && !isArchiveFolder) {
        options.push({
          key: "separator0",
          isSeparator: true,
        });
      }

      options.push(archiveOptions);

      canDelete &&
        options.push({
          key: "delete-rooms",
          label: t("Common:Delete"),
          icon: TrashReactSvgUrl,
          onClick: () => deleteRooms(t),
        });

      return options;
    }

    const hasDownloadAccess =
      selection.findIndex((k) => k.security.Download) !== -1;

    const sharingItems =
      selection.filter(
        (k) => k.contextOptions.includes("sharing-settings") && k.canShare
      ).length && !personal;

    const favoriteItems = selection.filter((k) =>
      k.contextOptions.includes("mark-as-favorite")
    );

    const moveItems = selection.filter((k) =>
      k.contextOptions.includes("move-to")
    ).length;

    const copyItems = selection.filter((k) =>
      k.contextOptions.includes("copy-to")
    ).length;

    const restoreItems = selection.filter((k) =>
      k.contextOptions.includes("restore")
    ).length;

    const removeFromFavoriteItems = selection.filter((k) =>
      k.contextOptions.includes("remove-from-favorites")
    );

    const deleteItems = selection.filter((k) =>
      k.contextOptions.includes("delete")
    ).length;

    const isRootThirdPartyFolder = selection.some(
      (x) => x.providerKey && x.id === x.rootFolderId
    );

    const favoriteItemsIds = favoriteItems.map((item) => item.id);

    const removeFromFavoriteItemsIds = removeFromFavoriteItems.map(
      (item) => item.id
    );

    const options = [
      {
        key: "sharing-settings",
        label: t("SharingPanel:SharingSettingsTitle"),
        icon: ShareReactSvgUrl,
        onClick: this.onClickShare,
        disabled: !sharingItems,
      },
      {
        key: "separator0",
        isSeparator: true,
        disabled: !sharingItems,
      },
      {
        key: "mark-as-favorite",
        label: t("MarkAsFavorite"),
        icon: FavoritesReactSvgUrl,
        onClick: (e) => this.onClickFavorite(e, favoriteItemsIds, t),
        disabled: !favoriteItems.length,
        "data-action": "mark",
        action: "mark",
      },
      {
        key: "remove-from-favorites",
        label: t("RemoveFromFavorites"),
        icon: FavoritesReactSvgUrl,
        onClick: (e) => this.onClickFavorite(e, removeFromFavoriteItemsIds, t),
        disabled: favoriteItems.length || !removeFromFavoriteItems.length,
        "data-action": "remove",
        action: "remove",
      },
      {
        id: "create_room",
        key: "create-room",
        label: t("Files:CreateRoom"),
        icon: CatalogRoomsReactSvgUrl,
        onClick: this.onClickCreateRoom,
        disabled: this.selectedFolderStore.rootFolderType !== FolderType.USER,
      },
      {
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () =>
          this.filesActionsStore
            .downloadAction(t("Translations:ArchivingData"))
            .catch((err) => toastr.error(err)),
        disabled: !hasDownloadAccess,
      },
      {
        key: "download-as",
        label: t("Translations:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: this.onClickDownloadAs,
        disabled: !hasDownloadAccess,
      },
      {
        key: "move-to",
        label: t("Common:MoveTo"),
        icon: MoveReactSvgUrl,
        onClick: allFilesIsEditing
          ? () => this.onShowEditingToast(t)
          : this.onMoveAction,
        disabled: isRecycleBinFolder || !moveItems,
      },
      {
        key: "copy-to",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        onClick: this.onCopyAction,
        disabled: isRecycleBinFolder || !copyItems,
      },
      {
        key: "restore",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: this.onRestoreAction,
        disabled: !isRecycleBinFolder || !restoreItems,
      },
      {
        key: "separator1",
        isSeparator: true,
        disabled: !deleteItems || isRootThirdPartyFolder,
      },
      {
        key: "delete",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: allFilesIsEditing
          ? () => this.onShowEditingToast(t)
          : () => {
              if (this.filesSettingsStore.confirmDelete) {
                setDeleteDialogVisible(true);
              } else {
                const translations = {
                  deleteOperation: t("Translations:DeleteOperation"),
                  deleteFromTrash: t("Translations:DeleteFromTrash"),
                  deleteSelectedElem: t("Translations:DeleteSelectedElem"),
                  FileRemoved: t("Files:FileRemoved"),
                  FolderRemoved: t("Files:FolderRemoved"),
                };

                this.filesActionsStore
                  .deleteAction(translations)
                  .catch((err) => toastr.error(err));
              }
            },
        disabled: !deleteItems || isRootThirdPartyFolder,
      },
    ];

    const { isCollaborator } = this.userStore?.user || {
      isCollaborator: false,
    };

    const newOptions = options.filter(
      (option, index) =>
        !(index === 0 && option.key === "separator1") &&
        !(isCollaborator && option.key === "create-room")
    );

    return newOptions;
  };

  getModel = (item, t) => {
    const { selection } = this.filesStore;

    const { fileExst, contextOptions } = item;

    const contextOptionsProps =
      contextOptions && contextOptions.length > 0
        ? selection.length > 1
          ? this.getGroupContextOptions(t)
          : this.getFilesContextOptions(item, t)
        : [];

    return contextOptionsProps;
  };
}

export default ContextOptionsStore;
