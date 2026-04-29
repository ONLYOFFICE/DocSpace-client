import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import { toastr } from "@docspace/ui-kit/components/toast";

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
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";

import { useFilesSelectionStore } from "../_store/FilesSelectionStore";
import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";

import { TFileItem, TFolderItem } from "./useItemList";
import useFolderActions from "./useFolderActions";
import useFilesActions from "./useFilesActions";
import useDownloadActions from "./useDownloadActions";
import useFavoritesActions from "./useFavoritesActions";

type UseContextMenuModelProps = {
  item?: TFileItem | TFolderItem;
  onShareClick?: (item: TFileItem | TFolderItem) => void;
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
};

export default function useContextMenuModel({
  item,
  onShareClick,
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
}: UseContextMenuModelProps) {
  const { t } = useTranslation(["Common"]);

  const filesSelectionStore = useFilesSelectionStore();

  const { openFolder, copyFolderLink } = useFolderActions({ t });
  const { openFile, copyFileLink } = useFilesActions({ t });
  const { downloadAction, downloadAsAction } = useDownloadActions();
  const { markAsFavorite, removeFromFavorites, removeFromRecent } =
    useFavoritesActions({ t });

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

  const getShareItem = useCallback(
    (i: TFileItem | TFolderItem) => {
      return {
        id: "option_share",
        key: "share",
        label: t("Common:Share"),
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

  const getGroupCopyItem = useCallback(() => {
    const canCopy = filesSelectionStore.selection.every(
      (i) => i.security.Copy,
    );
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
    const canMove = filesSelectionStore.selection.every(
      (i) => i.security.Move,
    );
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
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => {
        onDeleteSelectedClick?.(filesSelectionStore.selection);
      },
      disabled: !onDeleteSelectedClick || !canDelete,
    };
  }, [t, onDeleteSelectedClick, filesSelectionStore.selection]);

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
  }, [filesSelectionStore.selection, getDownloadAsItem, getDownloadItem, getGroupCopyItem, getGroupMoveItem, getGroupRestoreItem, getGroupDeleteItem, onCopySelectedClick, onMoveSelectedClick, onRestoreSelectedClick, onDeleteSelectedClick]);

  const getHeaderContextMenuModel = useCallback(() => {
    const base = getGroupContextMenuModel();

    const singleFile =
      filesSelectionStore.selection.length === 1 &&
      !filesSelectionStore.selection[0].isFolder
        ? (filesSelectionStore.selection[0] as TFileItem)
        : null;

    if (singleFile) {
      // Pull delete out so we can put it last
      const deleteIndex = base.findLastIndex(
        (i) => i.key === "delete" || i.key === "delete-permanently",
      );
      const deleteItem = deleteIndex >= 0 ? base.splice(deleteIndex, 1)[0] : null;

      const favItem = singleFile.isFavorite
        ? getRemoveFromFavoritesItem(singleFile)
        : getMarkAsFavoriteItem(singleFile);

      base.push(favItem);

      if (singleFile.contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.removeFromRecent)) {
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

      const model = [];

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.select))
        model.push(getSelectItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.open))
        model.push(getOpenItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.view))
        model.push(getViewItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.openPDF))
        model.push(getOpenPDFItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.fillForm))
        model.push(getFillFormItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.edit))
        model.push(getEditItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.preview))
        model.push(getPreviewItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.share))
        model.push(getShareItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.copyLink))
        model.push(getLinkForRoomMembersItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.download))
        model.push(getDownloadItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.downloadAs))
        model.push(getDownloadAsItem());

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.moveTo))
        model.push(getMoveToItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.copy))
        model.push(getCopyItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.duplicate))
        model.push(getDuplicateItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.rename))
        model.push(getRenameItem(item!));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.restore))
        model.push(getRestoreItem(item!));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.markAsFavorite) ||
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.removeFromFavorites)
      ) {
        if (item!.isFavorite) {
          model.push(getRemoveFromFavoritesItem(item!));
        } else {
          model.push(getMarkAsFavoriteItem(item!));
        }
      }

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.removeFromRecent))
        model.push(getRemoveFromRecentItem(item as TFileItem));

      if (
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.delete) ||
        contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.deletePermanently)
      )
        model.push(getDeleteItem(item!));

      return model;
    },
    [
      item,
      getSelectItem,
      getOpenItem,
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
      getShareItem,
      getCopyItem,
      getDuplicateItem,
      getMoveToItem,
      getRenameItem,
      getRestoreItem,
      getDeleteItem,
      getHeaderContextMenuModel,
      getGroupContextMenuModel,

      filesSelectionStore,
    ],
  );

  return { getContextMenuModel, getHeaderContextMenuModel };
}
