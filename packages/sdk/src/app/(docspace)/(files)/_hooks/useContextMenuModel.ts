import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";

import { useFilesSelectionStore } from "../../_store/FilesSelectionStore";
import useFolderActions from "../../_hooks/useFolderActions";

import { TFileItem, TFolderItem } from "./useItemList";
import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";
import useFilesActions from "../../_hooks/useFilesActions";
import { toastr } from "@docspace/shared/components/toast";

type UseContextMenuModelProps = {
  item: TFileItem | TFolderItem;
};

export default function useContextMenuModel({
  item,
}: UseContextMenuModelProps) {
  const { t } = useTranslation(["Common"]);

  const filesSelectionStore = useFilesSelectionStore();

  const { openFolder, copyFolderLink } = useFolderActions({ t });
  const { openFile, copyFileLink } = useFilesActions({ t });

  const getSelectItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_select",
        key: "select",
        label: t("Common:SelectAction"),
        icon: CheckBoxReactSvgUrl,
        onClick: () => filesSelectionStore.addSelection(item),
        disabled: false,
      };
    },
    [t, filesSelectionStore],
  );

  const getOpenItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_open",
        key: "open",
        label: t("Common:Open"),
        icon: FolderReactSvgUrl,
        onClick: () => openFolder(item.id, item.title),
        disabled: false,
      };
    },
    [t, openFolder],
  );

  const getPreviewItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_preview",
        key: "preview",
        label: t("Common:Preview"),
        icon: EyeReactSvgUrl,
        onClick: () => openFile(item.id, true),
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getLinkForRoomMembersItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_link-for-room-members",
        key: "link-for-room-members",
        label: t("Files:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: item.isFolder
          ? () => copyFolderLink(item.id)
          : () => copyFileLink(item.id),
        disabled: false,
      };
    },
    [copyFileLink, copyFolderLink, t],
  );

  const getOpenPDFItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_open-pdf",
        key: "open-pdf",
        label: t("Common:Open"),
        icon: EyeReactSvgUrl,
        onClick: () => openFile(item.id, false),
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getDownloadItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_download",
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => {},
        disabled: false,
      };
    },
    [t],
  );

  const getDownloadAsItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        key: "download-as",
        label: t("Common:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: () => {},
        disabled: false,
      };
    },
    [t],
  );

  const getViewItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_view",
        key: "view",
        label: t("Common:View"),
        icon: EyeReactSvgUrl,
        onClick: () => {},
        disabled: false,
      };
    },
    [t],
  );

  const getEditItem = useCallback(
    (item: TFileItem) => {
      return {
        id: "option_edit",
        key: "edit",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: () => {
          const isPdf = item.fileExst === ".pdf";
          if (isPdf && isMobile) {
            toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
            return;
          }

          // TODO: check convert
          openFile(item.id);
        },
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getFillFormItem = useCallback(
    (item: TFileItem) => {
      return {
        id: "option_fill-form",
        key: "fill-form",
        label: t("Common:FillFormButton"),
        icon: FormFillRectSvgUrl,
        onClick: () => openFile(item.id, false, false, false),
        disabled: false,
      };
    },
    [openFile, t],
  );

  const getGroupContextMenuModel = useCallback(() => {
    return [];
  }, []);

  const getContextMenuModel = useCallback(
    (skipSelect: boolean = false) => {
      const { contextOptions } = item;

      if (!skipSelect) {
        if (filesSelectionStore.selection.length) {
          if (filesSelectionStore.isCheckedItem(item))
            return getGroupContextMenuModel();

          filesSelectionStore.setSelection();
          filesSelectionStore.setBufferSelection(item);
        }
      }

      const model = [];

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.select))
        model.push(getSelectItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.open))
        model.push(getOpenItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.view))
        model.push(getViewItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.openPDF))
        model.push(getOpenPDFItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.fillForm))
        model.push(getFillFormItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.edit))
        model.push(getEditItem(item as TFileItem));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.preview))
        model.push(getPreviewItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.copyLink))
        model.push(getLinkForRoomMembersItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.download))
        model.push(getDownloadItem(item));

      if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.downloadAs))
        model.push(getDownloadAsItem(item));

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
      filesSelectionStore,
      getGroupContextMenuModel,
    ],
  );

  return { getContextMenuModel };
}
