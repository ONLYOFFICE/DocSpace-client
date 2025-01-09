import {
  RoomsProviderType,
  FileStatus,
  FilterType,
} from "@docspace/shared/enums";
import { getDaysRemaining } from "@docspace/shared/utils/date";
import { getItemUrl } from "SRC_DIR/helpers/filesUtils";

class ItemService {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getFilesList() {
    const newFolders = [...this.rootStore.folders];
    const orderItems = [
      ...this.rootStore.folders,
      ...this.rootStore.files,
    ].filter((x) => x.order);

    if (orderItems.length > 0) {
      this.rootStore.isEmptyPage && this.rootStore.setIsEmptyPage(false);

      orderItems.sort((a, b) => {
        if (a.order.includes(".")) {
          return (
            Number(a.order.split(".").at(-1)) -
            Number(b.order.split(".").at(-1))
          );
        }

        return Number(a.order) - Number(b.order);
      });

      return this.getFilesListItems(orderItems);
    }

    newFolders.sort((a, b) => {
      const firstValue = a.roomType ? 1 : 0;
      const secondValue = b.roomType ? 1 : 0;

      return secondValue - firstValue;
    });

    const items = [...newFolders, ...this.rootStore.files];

    if (items.length > 0 && this.rootStore.isEmptyPage) {
      this.rootStore.setIsEmptyPage(false);
    }

    return this.getFilesListItems(items);
  }

  getFilesListItems(items) {
    const { fileItemsList } = this.rootStore.pluginStore;
    const { enablePlugins } = this.rootStore.settingsStore;
    const { getIcon } = this.rootStore.filesSettingsStore;

    return items.map((item) => {
      const {
        availableExternalRights,
        access,
        autoDelete,
        originTitle,
        comment,
        contentLength,
        created,
        createdBy,
        encrypted,
        fileExst,
        filesCount,
        fileStatus,
        fileType,
        folderId,
        foldersCount,
        id,
        logo,
        locked,
        originId,
        originFolderId,
        originRoomId,
        originRoomTitle,
        parentId,
        pureContentLength,
        rootFolderType,
        rootFolderId,
        shared,
        title,
        type,
        hasDraft,
        updated,
        updatedBy,
        version,
        versionGroup,
        viewUrl,
        webUrl,
        providerKey,
        thumbnailUrl,
        thumbnailStatus,
        canShare,
        canEdit,
        roomType,
        isArchive,
        tags,
        pinned,
        security,
        viewAccessibility,
        mute,
        inRoom,
        requestToken,
        indexing,
        lifetime,
        denyDownload,
        lastOpened,
        quotaLimit,
        usedSpace,
        isCustomQuota,
        providerId,
        order,
        startFilling,
        draftLocation,
        expired,
        external,
        passwordProtected,
        watermark,
      } = item;

      const thirdPartyIcon = this.rootStore.thirdPartyStore.getThirdPartyIcon(
        item.providerKey,
        "small",
      );

      const providerType =
        RoomsProviderType[
          Object.keys(RoomsProviderType).find((key) => key === item.providerKey)
        ];

      const canOpenPlayer =
        item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

      const needConvert = item.viewAccessibility?.MustConvert;
      const isEditing =
        (item.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

      const previewUrl = canOpenPlayer
        ? getItemUrl(
            id,
            false,
            this.rootStore.categoryType,
            needConvert,
            canOpenPlayer,
            this.rootStore.publicRoomStore.publicRoomKey,
          )
        : null;

      const contextOptions = this.rootStore.getFilesContextOptions(item);
      const isThirdPartyFolder = providerKey && id === rootFolderId;

      let isFolder = false;
      this.rootStore.folders.forEach((x) => {
        if (x.id === item.id && x.parentId === item.parentId) isFolder = true;
      });

      const { isRecycleBinFolder } = this.rootStore.treeFoldersStore;

      const folderUrl =
        isFolder &&
        getItemUrl(
          id,
          isFolder,
          this.rootStore.categoryType,
          false,
          false,
          this.rootStore.publicRoomStore.publicRoomKey,
        );

      const docUrl =
        !canOpenPlayer &&
        !isFolder &&
        getItemUrl(
          id,
          false,
          this.rootStore.categoryType,
          needConvert,
          false,
          this.rootStore.publicRoomStore.publicRoomKey,
        );

      const href = isRecycleBinFolder
        ? null
        : previewUrl ||
          (!isFolder
            ? item.fileType === FilterType.Archive
              ? item.webUrl
              : docUrl
            : folderUrl);

      const isRoom = !!roomType;

      const icon =
        isRoom && logo?.medium
          ? logo?.medium
          : getIcon(
              32,
              fileExst,
              providerKey,
              contentLength,
              roomType,
              isArchive,
              type,
            );

      const defaultRoomIcon = isRoom
        ? getIcon(
            32,
            fileExst,
            providerKey,
            contentLength,
            roomType,
            isArchive,
            type,
          )
        : undefined;

      const pluginOptions = {};

      if (enablePlugins && fileItemsList) {
        fileItemsList.forEach(({ value }) => {
          if (value.extension === fileExst) {
            if (value.fileTypeName)
              pluginOptions.fileTypeName = value.fileTypeName;
            pluginOptions.isPlugin = true;
            if (value.fileIconTile)
              pluginOptions.fileTileIcon = value.fileIconTile;
          }
        });
      }

      const isForm = fileExst === ".oform";

      return {
        availableExternalRights,
        access,
        daysRemaining: autoDelete && getDaysRemaining(autoDelete),
        originTitle,
        comment,
        contentLength,
        contextOptions,
        created,
        createdBy,
        encrypted,
        fileExst,
        filesCount,
        fileStatus,
        fileType,
        folderId,
        foldersCount,
        icon,
        defaultRoomIcon,
        id,
        isFolder,
        logo,
        locked,
        new: item.new,
        mute,
        parentId,
        pureContentLength,
        rootFolderType,
        rootFolderId,
        shared,
        title,
        updated,
        updatedBy,
        version,
        versionGroup,
        viewUrl,
        webUrl,
        providerKey,
        canOpenPlayer,
        canShare,
        canEdit,
        thumbnailUrl,
        thumbnailStatus,
        originId,
        originFolderId,
        originRoomId,
        originRoomTitle,
        previewUrl,
        folderUrl,
        href,
        isThirdPartyFolder,
        isEditing,
        roomType,
        isRoom,
        isArchive,
        tags,
        pinned,
        thirdPartyIcon,
        providerType,
        security,
        viewAccessibility,
        ...pluginOptions,
        inRoom,
        indexing,
        lifetime,
        denyDownload,
        type,
        hasDraft,
        isForm,
        isPDFForm: item.isForm,
        requestToken,
        lastOpened,
        quotaLimit,
        usedSpace,
        isCustomQuota,
        providerId,
        order,
        startFilling,
        draftLocation,
        expired,
        external,
        passwordProtected,
        watermark,
      };
    });
  }
}

export default ItemService;
