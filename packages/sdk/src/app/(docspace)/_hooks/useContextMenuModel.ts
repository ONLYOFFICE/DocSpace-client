import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import { toastr } from "@docspace/ui-kit/components/toast";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { CHAT_SUPPORTED_FORMATS } from "@docspace/ui-kit/ai-agent/chat/Chat.constants";
import { FileType } from "@docspace/shared/enums";

import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";
import FavoritesFillReactSvgUrl from "PUBLIC_DIR/images/favorite.fill.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import ShareSvgUrl from "PUBLIC_DIR/images/icons/12/share.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/icons/16/custom-filter.react.svg?url";
import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import AISvgUrl from "PUBLIC_DIR/images/icons/16/AI.svg?url";
import DotsHorizontalReactSvgUrl from "PUBLIC_DIR/images/icons/16/dots-horizontal.react.svg?url";

import { useFilesSelectionStore } from "../_store/FilesSelectionStore";
import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";

import { TFileItem, TFolderItem } from "./useItemList";
import useFolderActions from "./useFolderActions";
import useFilesActions from "./useFilesActions";
import useDownloadActions from "./useDownloadActions";
import useFavoritesActions from "./useFavoritesActions";

// Files the AI chat can ingest as an attachment: the document set the chat
// supports (CHAT_SUPPORTED_FORMATS) plus any image. Gates the "Ask AI" entry.
const ASK_AI_SUPPORTED_EXTS = new Set(
  CHAT_SUPPORTED_FORMATS.split(",").map((ext) => ext.trim().toLowerCase()),
);

const isAskAiSupportedFile = (item: TFileItem): boolean => {
  if (item.fileType === FileType.Image) return true;
  const ext = (item.fileExst ?? "").replace(/^\./, "").toLowerCase();
  return ASK_AI_SUPPORTED_EXTS.has(ext);
};

type UseContextMenuModelProps = {
  item?: TFileItem | TFolderItem;
  onShareClick?: (item: TFileItem | TFolderItem) => void;
  onInfoClick?: (item: TFileItem | TFolderItem) => void;
  onDeleteClick?: (item: TFileItem | TFolderItem) => void;
  onDeleteSelectedClick?: (items: (TFileItem | TFolderItem)[]) => void;
  onCopyClick?: (item: TFileItem | TFolderItem) => void;
  onMoveClick?: (item: TFileItem | TFolderItem) => void;
  onDuplicateClick?: (item: TFileItem | TFolderItem) => void;
  onRestoreClick?: (item: TFileItem | TFolderItem) => void;
  onRenameClick?: (item: TFileItem | TFolderItem) => void;
  onCopySelectedClick?: (items: (TFileItem | TFolderItem)[]) => void;
  onMoveSelectedClick?: (items: (TFileItem | TFolderItem)[]) => void;
  onRestoreSelectedClick?: (items: (TFileItem | TFolderItem)[]) => void;
  onShowVersionHistoryClick?: (item: TFileItem) => void;
  /**
   * Caller-supplied retry handler for AI Knowledge files. When provided
   * (e.g. from the ai-agents row components), the "Vectorization" menu
   * entry calls into it; otherwise the entry stays inert. Mirrors the
   * client's `filesActionsStore.retryVectorization` wiring.
   */
  onRetryVectorization?: (item: TFileItem) => void;
  /**
   * Caller-supplied handler that opens the AI chat and attaches the file.
   * When provided (only personal-files, via [[AskAIContext]]), the "AI
   * features → Ask AI" entry is shown for supported files; otherwise it
   * stays hidden.
   */
  onAskAI?: (item: TFileItem) => void;
  /**
   * Switches `getHeaderContextMenuModel` to the rooms branch (pin/unpin,
   * archive, delete-room) instead of the generic file actions. Set by
   * `RoomsLayout` for the active-rooms section.
   */
  isRoomsFolder?: boolean;
  isArchiveRoomsFolder?: boolean;
  onArchiveSelectedClick?: (items: (TFileItem | TFolderItem)[]) => void;
  onPinSelectedClick?: (items: (TFileItem | TFolderItem)[]) => void;
};

export default function useContextMenuModel({
  item,
  onShareClick,
  onInfoClick,
  onDeleteClick,
  onDeleteSelectedClick,
  onCopyClick,
  onMoveClick,
  onDuplicateClick,
  onRestoreClick,
  onRenameClick,
  onCopySelectedClick,
  onMoveSelectedClick,
  onRestoreSelectedClick,
  onShowVersionHistoryClick,
  onRetryVectorization,
  onAskAI,
  isRoomsFolder,
  isArchiveRoomsFolder,
  onArchiveSelectedClick,
  onPinSelectedClick,
}: UseContextMenuModelProps) {
  const { t } = useTranslation(["Common"]);

  const filesSelectionStore = useFilesSelectionStore();

  const { openFolder, copyFolderLink, openLocation } = useFolderActions({ t });
  const { openFile, copyFileLink, lockFile, changeCustomFilter } =
    useFilesActions({ t });
  const { downloadAction, downloadAsAction } = useDownloadActions();
  const {
    markAsFavorite,
    removeFromFavorites,
    removeFromRecent,
    removeFromSharedWithMe,
  } = useFavoritesActions({ t });

  const getSelectItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_select",
        key: "select",
        label: t("Common:SelectAction"),
        icon: CheckBoxReactSvgUrl,
        onClick: () => filesSelectionStore.addSelection(i),
        disabled: false,
      };
    },
    [t, filesSelectionStore],
  );

  const getOpenItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_open",
        key: "open",
        label: t("Common:Open"),
        icon: FolderReactSvgUrl,
        onClick: () => openFolder(i.id, i.title),
        disabled: false,
      };
    },
    [t, openFolder],
  );

  const getOpenLocationItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      const isFile = "folderId" in i;
      const locationId = isFile ? i.folderId : i.parentId;
      const search = isFile ? i.title.replace(i.fileExst ?? "", "") : i.title;

      return {
        id: "option_open-location",
        key: "open-location",
        label: t("Common:OpenLocation"),
        icon: FolderLocationReactSvgUrl,
        onClick: () => openLocation(locationId, i.id, search),
        disabled: false,
      };
    },
    [t, openLocation],
  );

  const getPreviewItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_preview",
        key: "preview",
        label: t("Common:Preview"),
        icon: EyeReactSvgUrl,
        onClick: () => openFile(i, true),
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getLinkForRoomMembersItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_link-for-room-members",
        key: "link-for-room-members",
        label: t("Common:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: i.isFolder
          ? () => copyFolderLink(i.id)
          : () => copyFileLink(i.id),
        disabled: false,
      };
    },
    [copyFileLink, copyFolderLink, t],
  );

  const getOpenPDFItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_open-pdf",
        key: "open-pdf",
        label: t("Common:Open"),
        icon: EyeReactSvgUrl,
        onClick: () => openFile(i, false),
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getDownloadItem = useCallback(
    (i?: TFileItem | TFolderItem) => {
      const isDisabled = i
        ? !i.security.Download
        : filesSelectionStore.selection.some((k) => !k.security.Download);

      return {
        id: "option_download",
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => downloadAction(i),
        disabled: isDisabled,
      };
    },
    [t, filesSelectionStore.selection, downloadAction],
  );

  const getDownloadAsItem = useCallback(() => {
    return {
      key: "download-as",
      label: t("Common:DownloadAs"),
      icon: DownloadAsReactSvgUrl,
      onClick: downloadAsAction,
      disabled: false,
    };
  }, [downloadAsAction, t]);

  const getViewItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_view",
        key: "view",
        label: t("Common:View"),
        icon: EyeReactSvgUrl,
        onClick: () => openFile(i),
        disabled: false,
      };
    },
    [t, openFile],
  );

  const getEditItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_edit",
        key: "edit",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: () => {
          const isPdf = i.fileExst === ".pdf";
          if (isPdf && isMobile) {
            toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
            return;
          }

          // TODO: check convert
          openFile(i);
        },
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getFillFormItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_fill-form",
        key: "fill-form",
        label: t("Common:FillFormButton"),
        icon: FormFillRectSvgUrl,
        onClick: () => openFile(i, false, false, false),
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getMarkAsFavoriteItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_mark-as-favorite",
        key: "mark-as-favorite",
        label: t("Common:MarkAsFavorite"),
        icon: FavoritesReactSvgUrl,
        onClick: () => markAsFavorite(i),
        disabled: false,
      };
    },
    [t, markAsFavorite],
  );

  const getRemoveFromFavoritesItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_remove-from-favorites",
        key: "remove-from-favorites",
        label: t("Common:RemoveFromFavorites"),
        icon: FavoritesFillReactSvgUrl,
        onClick: () => removeFromFavorites(i),
        disabled: false,
      };
    },
    [t, removeFromFavorites],
  );

  const getRemoveFromRecentItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_remove-from-recent",
        key: "remove-from-recent",
        label: t("Common:RemoveFromList"),
        icon: RemoveOutlineSvgUrl,
        onClick: () => removeFromRecent(i),
        disabled: false,
      };
    },
    [t, removeFromRecent],
  );

  const getRemoveFromSharedWithMeItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "menu-remove-from-shared-with-me",
        key: "remove-from-shared-with-me",
        label: t("Common:RemoveFromList"),
        icon: RemoveOutlineSvgUrl,
        onClick: () => removeFromSharedWithMe(i),
        disabled: false,
      };
    },
    [t, removeFromSharedWithMe],
  );

  const getShareItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_share",
        key: "share",
        label: t("Common:SharingSettings"),
        icon: ShareSvgUrl,
        onClick: () => onShareClick?.(i),
        disabled: !onShareClick,
      };
    },
    [t, onShareClick],
  );

  const getCopyItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_copy",
        key: "copy",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        onClick: () => onCopyClick?.(i),
        disabled: !onCopyClick,
      };
    },
    [t, onCopyClick],
  );

  const getDuplicateItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_duplicate",
        key: "duplicate",
        label: t("Common:Duplicate"),
        icon: DuplicateReactSvgUrl,
        onClick: () => onDuplicateClick?.(i),
        disabled: !onDuplicateClick,
      };
    },
    [t, onDuplicateClick],
  );

  const getMoveToItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_move-to",
        key: "move-to",
        label: t("Common:MoveTo"),
        icon: MoveReactSvgUrl,
        onClick: () => onMoveClick?.(i),
        disabled: !onMoveClick,
      };
    },
    [t, onMoveClick],
  );

  const getShowVersionHistoryItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_show-version-history",
        key: "show-version-history",
        label: t("Common:ShowVersionHistory"),
        icon: HistoryFinalizedReactSvgUrl,
        onClick: () => onShowVersionHistoryClick?.(i),
        disabled: !onShowVersionHistoryClick,
      };
    },
    [t, onShowVersionHistoryClick],
  );

  const getBlockUnblockVersionItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_block-unblock-version",
        key: "block-unblock-version",
        label: i.locked ? t("Common:UnblockFile") : t("Common:BlockFile"),
        icon: LockedReactSvgUrl,
        onClick: () => lockFile(i),
        disabled: false,
      };
    },
    [t, lockFile],
  );

  const getCustomFilterItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_custom-filter",
        key: "custom-filter",
        label: i.customFilterEnabled
          ? t("Common:CustomFilterDisable")
          : t("Common:CustomFilterEnable"),
        icon: CustomFilterReactSvgUrl,
        onClick: () => changeCustomFilter(i),
        disabled: false,
      };
    },
    [t, changeCustomFilter],
  );

  const getShowInfoItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      const isFolder = "isFolder" in i && i.isFolder;
      return {
        id: "option_show-info",
        key: "show-info",
        label: isFolder ? t("Common:FolderInfo") : t("Common:FileInfo"),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => onInfoClick?.(i),
        disabled: !onInfoClick,
      };
    },
    [t, onInfoClick],
  );

  const getRenameItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_rename",
        key: "rename",
        label: t("Common:Rename"),
        icon: RenameReactSvgUrl,
        onClick: () => onRenameClick?.(i),
        disabled: !onRenameClick,
      };
    },
    [t, onRenameClick],
  );

  const getRestoreItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_restore",
        key: "restore",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: () => onRestoreClick?.(i),
        disabled: !onRestoreClick,
      };
    },
    [t, onRestoreClick],
  );

  const getDeleteItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_delete",
        key: "delete",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => onDeleteClick?.(i),
        disabled: !onDeleteClick,
      };
    },
    [t, onDeleteClick],
  );

  const getVectorizationItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_vectorization",
        key: "vectorization",
        label: t("Common:Vectorization"),
        icon: RefreshReactSvgUrl,
        onClick: () => onRetryVectorization?.(i),
        disabled: !onRetryVectorization || !i.security?.Vectorization,
      };
    },
    [t, onRetryVectorization],
  );

  const getAskAIItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_ask-ai",
        key: "ask-ai",
        label: t("Common:AskAI"),
        icon: AISvgUrl,
        onClick: () => onAskAI?.(i),
        disabled: !onAskAI,
      };
    },
    [t, onAskAI],
  );

  // Parent "AI features" submenu collecting every AI action for a file.
  // Currently holds "Ask AI"; future AI entries slot in here.
  const getAIFeaturesItem = useCallback(
    (i: TFileItem) => {
      return {
        id: "option_ai-features",
        key: "ai-features",
        label: t("Common:AIFeatures"),
        icon: AISvgUrl,
        items: [getAskAIItem(i)],
      };
    },
    [t, getAskAIItem],
  );

  const getGroupCopyItem = useCallback(() => {
    const canCopy = filesSelectionStore.selection.every((i) => i.security.Copy);
    return {
      id: "option_copy",
      key: "copy",
      label: t("Common:Copy"),
      icon: CopyReactSvgUrl,
      onClick: () => {
        onCopySelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onCopySelectedClick || !canCopy,
    };
  }, [t, onCopySelectedClick, filesSelectionStore.selection]);

  const getGroupMoveItem = useCallback(() => {
    const canMove = filesSelectionStore.selection.every((i) => i.security.Move);
    return {
      id: "option_move-to",
      key: "move-to",
      label: t("Common:MoveTo"),
      icon: MoveReactSvgUrl,
      onClick: () => {
        onMoveSelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onMoveSelectedClick || !canMove,
    };
  }, [t, onMoveSelectedClick, filesSelectionStore.selection]);

  const getGroupRestoreItem = useCallback(() => {
    return {
      id: "option_restore",
      key: "restore",
      label: t("Common:Restore"),
      icon: MoveReactSvgUrl,
      onClick: () => {
        onRestoreSelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onRestoreSelectedClick,
    };
  }, [t, onRestoreSelectedClick, filesSelectionStore.selection]);

  const getGroupDeleteItem = useCallback(() => {
    const canDelete = filesSelectionStore.selection.every(
      (i) => i.security.Delete,
    );
    return {
      id: "option_delete",
      key: "delete",
      label: isRoomsFolder ? t("Common:DeleteRoom") : t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => {
        onDeleteSelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onDeleteSelectedClick || !canDelete,
    };
  }, [t, isRoomsFolder, onDeleteSelectedClick, filesSelectionStore.selection]);

  // Mirrors client's `getOption("pin"|"unpin")` toggle: if any selected room
  // is unpinned, the bulk action pins; only when *every* room is already
  // pinned do we offer "Unpin".
  const getRoomsPinItem = useCallback(() => {
    const allPinned =
      filesSelectionStore.selection.length > 0 &&
      filesSelectionStore.selection.every(
        (i) => "pinned" in i && (i as { pinned?: boolean }).pinned,
      );
    return {
      id: allPinned ? "option_unpin" : "option_pin",
      key: allPinned ? "unpin" : "pin",
      label: allPinned ? t("Common:Unpin") : t("Common:Pin"),
      icon: allPinned ? UnpinReactSvgUrl : PinReactSvgUrl,
      onClick: () => {
        onPinSelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onPinSelectedClick,
    };
  }, [t, onPinSelectedClick, filesSelectionStore.selection]);

  const getRoomsArchiveItem = useCallback(() => {
    const canArchive = filesSelectionStore.selection.every(
      (i) => i.security.Move,
    );
    return {
      id: "option_archive",
      key: "archive",
      label: t("Common:MoveToArchive"),
      icon: RoomArchiveSvgUrl,
      onClick: () => {
        onArchiveSelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onArchiveSelectedClick || !canArchive,
    };
  }, [t, onArchiveSelectedClick, filesSelectionStore.selection]);

  const getRoomsFolderOptions = useCallback(() => {
    if (isArchiveRoomsFolder) {
      return [getGroupRestoreItem(), getGroupDeleteItem()];
    }
    return [getRoomsPinItem(), getRoomsArchiveItem(), getGroupDeleteItem()];
  }, [
    isArchiveRoomsFolder,
    getRoomsPinItem,
    getRoomsArchiveItem,
    getGroupRestoreItem,
    getGroupDeleteItem,
  ]);

  const getGroupContextMenuModel = useCallback(() => {
    const items = [];

    items.push(getDownloadItem());

    if (
      filesSelectionStore.selection.some((i) => "fileExst" in i && i.fileExst)
    ) {
      items.push(getDownloadAsItem());
    }

    if (onCopySelectedClick) {
      items.push(getGroupCopyItem());
    }

    if (onMoveSelectedClick) {
      items.push(getGroupMoveItem());
    }

    if (onRestoreSelectedClick) {
      items.push(getGroupRestoreItem());
    }

    if (onDeleteSelectedClick) {
      items.push(getGroupDeleteItem());
    }

    return items;
  }, [
    filesSelectionStore.selection,
    getDownloadAsItem,
    getDownloadItem,
    getGroupCopyItem,
    getGroupMoveItem,
    getGroupRestoreItem,
    getGroupDeleteItem,
    onCopySelectedClick,
    onMoveSelectedClick,
    onRestoreSelectedClick,
    onDeleteSelectedClick,
  ]);

  const getHeaderContextMenuModel = useCallback(() => {
    const base = isRoomsFolder
      ? getRoomsFolderOptions()
      : getGroupContextMenuModel();

    const singleFile =
      !isRoomsFolder &&
      filesSelectionStore.selection.length === 1 &&
      !filesSelectionStore.selection[0].isFolder
        ? (filesSelectionStore.selection[0] as TFileItem)
        : null;

    if (singleFile) {
      // Pull delete out so we can put it last
      const deleteIndex = base.findLastIndex(
        (i) => i.key === "delete" || i.key === "delete-permanently",
      );
      const deleteItem =
        deleteIndex >= 0 ? base.splice(deleteIndex, 1)[0] : null;

      const favItem = singleFile.isFavorite
        ? getRemoveFromFavoritesItem(singleFile)
        : getMarkAsFavoriteItem(singleFile);

      base.push(favItem);

      if (
        singleFile.contextOptions.includes(
          AVAILABLE_CONTEXT_ITEMS.removeFromRecent,
        )
      ) {
        base.push(getRemoveFromRecentItem(singleFile));
      }

      if (deleteItem) {
        base.push(deleteItem);
      }
    }

    return base.map((i) => ({
      iconUrl: i.icon,
      label: i.label,
      title: i.label,

      disabled: i.disabled,

      withDropDown: false,
      options: [],

      onClick: i.onClick,
      id: i.key,
      key: i.key,
    }));
  }, [
    isRoomsFolder,
    getRoomsFolderOptions,
    getGroupContextMenuModel,
    getMarkAsFavoriteItem,
    getRemoveFromFavoritesItem,
    getRemoveFromRecentItem,
    filesSelectionStore.selection,
  ]);

  const getContextMenuModel = useCallback(
    (skipSelect: boolean = false) => {
      if (!item) {
        return getHeaderContextMenuModel();
      }

      const { contextOptions } = item!;

      if (!skipSelect) {
        if (
          filesSelectionStore.selection.length &&
          filesSelectionStore.isCheckedItem(item!)
        ) {
          return getGroupContextMenuModel();
        }
      }

      const openGroup: ContextMenuModel[] = [];
      const aiGroup: ContextMenuModel[] = [];
      const actionGroup: ContextMenuModel[] = [];
      const favoritesGroup: ContextMenuModel[] = [];
      const deleteGroup: ContextMenuModel[] = [];

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.select))
        openGroup.push(getSelectItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.open))
        openGroup.push(getOpenItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.openLocation))
        openGroup.push(getOpenLocationItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.view))
        openGroup.push(getViewItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.openPDF))
        openGroup.push(getOpenPDFItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.fillForm))
        openGroup.push(getFillFormItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.edit))
        openGroup.push(getEditItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.preview))
        openGroup.push(getPreviewItem(item as TFileItem));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.vectorization) &&
        !("isFolder" in item! && item!.isFolder)
      )
        openGroup.push(getVectorizationItem(item as TFileItem));

      if (
        onAskAI &&
        !("isFolder" in item! && item!.isFolder) &&
        isAskAiSupportedFile(item as TFileItem)
      )
        aiGroup.push(getAIFeaturesItem(item as TFileItem));

      const hasShare = contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.share);
      const hasCopyLink = contextOptions.includes(
        AVAILABLE_CONTEXT_ITEMS.copyLink,
      );

      if (hasShare && hasCopyLink) {
        actionGroup.push({
          id: "option_share",
          key: "share",
          label: t("Common:Share"),
          icon: ShareReactSvgUrl,
          items: [getShareItem(item!), getLinkForRoomMembersItem(item!)],
        });
      } else {
        if (hasShare) actionGroup.push(getShareItem(item!));
        if (hasCopyLink) actionGroup.push(getLinkForRoomMembersItem(item!));
      }

      const moveOrCopyItems: ContextMenuModel[] = [];
      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.moveTo))
        moveOrCopyItems.push(getMoveToItem(item!));
      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.copy))
        moveOrCopyItems.push(getCopyItem(item!));
      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.duplicate))
        moveOrCopyItems.push(getDuplicateItem(item!));

      if (moveOrCopyItems.length) {
        actionGroup.push({
          id: "option_move-or-copy",
          key: "move-or-copy",
          label: t("Common:MoveOrCopy"),
          icon: MoveReactSvgUrl,
          items: moveOrCopyItems,
        });
      }

      const hasDownload = contextOptions.includes(
        AVAILABLE_CONTEXT_ITEMS.download,
      );
      const hasDownloadAs = contextOptions.includes(
        AVAILABLE_CONTEXT_ITEMS.downloadAs,
      );

      if (hasDownload && hasDownloadAs) {
        actionGroup.push({
          id: "option_download-menu",
          key: "download-menu",
          label: t("Common:Download"),
          icon: DownloadReactSvgUrl,
          items: [getDownloadItem(item), getDownloadAsItem()],
        });
      } else if (hasDownload) {
        actionGroup.push(getDownloadItem(item));
      } else if (hasDownloadAs) {
        actionGroup.push(getDownloadAsItem());
      }

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.rename))
        actionGroup.push(getRenameItem(item!));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.markAsFavorite) &&
        !item!.isFavorite
      )
        favoritesGroup.push(getMarkAsFavoriteItem(item!));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.blockUnblockVersion) &&
        !("isFolder" in item! && item!.isFolder)
      )
        favoritesGroup.push(getBlockUnblockVersionItem(item as TFileItem));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.customFilter) &&
        !("isFolder" in item! && item!.isFolder)
      )
        favoritesGroup.push(getCustomFilterItem(item as TFileItem));

      const hasVersionHistory =
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.showVersionHistory) &&
        !("isFolder" in item! && item!.isFolder);
      const hasShowInfo = contextOptions.includes(
        AVAILABLE_CONTEXT_ITEMS.showInfo,
      );

      if (hasVersionHistory && hasShowInfo) {
        favoritesGroup.push({
          id: "option_more-options",
          key: "more-options",
          label: t("Common:MoreOptions"),
          icon: DotsHorizontalReactSvgUrl,
          items: [
            getShowVersionHistoryItem(item as TFileItem),
            getShowInfoItem(item!),
          ],
        });
      } else {
        if (hasVersionHistory)
          favoritesGroup.push(getShowVersionHistoryItem(item as TFileItem));
        if (hasShowInfo) favoritesGroup.push(getShowInfoItem(item!));
      }

      const restoreGroup: ContextMenuModel[] = [];

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.restore))
        restoreGroup.push(getRestoreItem(item!));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.removeFromFavorites) &&
        item!.isFavorite
      )
        deleteGroup.push(getRemoveFromFavoritesItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.removeFromRecent))
        deleteGroup.push(getRemoveFromRecentItem(item as TFileItem));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.removeFromSharedWithMe)
      )
        deleteGroup.push(getRemoveFromSharedWithMeItem(item!));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.delete) ||
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.deletePermanently)
      )
        deleteGroup.push(getDeleteItem(item!));

      const groups = [
        openGroup,
        aiGroup,
        actionGroup,
        favoritesGroup,
        restoreGroup,
        deleteGroup,
      ];
      const model: ContextMenuModel[] = [];
      groups.forEach((group) => {
        if (!group.length) return;
        if (model.length) {
          model.push({
            key: `separator-${model.length}`,
            isSeparator: true,
          });
        }
        model.push(...group);
      });

      return model;
    },
    [
      item,
      getSelectItem,
      getOpenItem,
      getOpenLocationItem,
      getViewItem,
      getOpenPDFItem,
      getFillFormItem,
      getEditItem,
      getPreviewItem,
      getLinkForRoomMembersItem,
      getDownloadItem,
      getDownloadAsItem,
      getMarkAsFavoriteItem,
      getRemoveFromFavoritesItem,
      getRemoveFromRecentItem,
      getRemoveFromSharedWithMeItem,
      getShareItem,
      getCopyItem,
      getDuplicateItem,
      getMoveToItem,
      getRenameItem,
      getRestoreItem,
      getShowInfoItem,
      getShowVersionHistoryItem,
      getBlockUnblockVersionItem,
      getCustomFilterItem,
      getDeleteItem,
      getVectorizationItem,
      getAIFeaturesItem,
      onAskAI,
      getHeaderContextMenuModel,
      getGroupContextMenuModel,

      filesSelectionStore,
    ],
  );

  return { getContextMenuModel, getHeaderContextMenuModel };
}

