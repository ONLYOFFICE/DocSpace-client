import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";

import { TFileItem, TFolderItem } from "./useItemList";
import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";

type UseContextMenuModelProps = {
  item: TFileItem | TFolderItem;
};

export default function useContextMenuModel({
  item,
}: UseContextMenuModelProps) {
  const { t } = useTranslation(["Common"]);

  const getSelectItem = useCallback((item: TFileItem | TFolderItem) => {
    return {
      id: "option_select",
      key: "select",
      label: t("Common:SelectAction"),
      icon: CheckBoxReactSvgUrl,
      onClick: () => {},
      disabled: false,
    };
  }, []);

  const getOpenItem = useCallback((item: TFileItem | TFolderItem) => {
    return {
      id: "option_open",
      key: "open",
      label: t("Common:Open"),
      icon: FolderReactSvgUrl,
      onClick: () => {},
      disabled: false,
    };
  }, []);

  const getPreviewItem = useCallback((item: TFileItem | TFolderItem) => {
    return {
      id: "option_preview",
      key: "preview",
      label: t("Common:Preview"),
      icon: EyeReactSvgUrl,
      onClick: () => {},
      disabled: false,
    };
  }, []);

  const getLinkForRoomMembersItem = useCallback(
    (item: TFileItem | TFolderItem) => {
      return {
        id: "option_link-for-room-members",
        key: "link-for-room-members",
        label: t("Files:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => {},
        disabled: false,
      };
    },
    [],
  );

  const getOpenPDFItem = useCallback((item: TFileItem | TFolderItem) => {
    return {
      id: "option_open-pdf",
      key: "open-pdf",
      label: t("Common:Open"),
      icon: EyeReactSvgUrl,
      onClick: () => {},
      disabled: false,
    };
  }, []);

  const getDownloadItem = useCallback((item: TFileItem | TFolderItem) => {
    return {
      id: "option_download",
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => {},
      disabled: false,
    };
  }, []);

  const getDownloadAsItem = useCallback((item: TFileItem | TFolderItem) => {
    return {
      key: "download-as",
      label: t("Common:DownloadAs"),
      icon: DownloadAsReactSvgUrl,
      onClick: () => {},
      disabled: false,
    };
  }, []);

  const getContextMenuModel = useCallback(() => {
    const { contextOptions } = item;

    const model = [];

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.select))
      model.push(getSelectItem(item));

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.open))
      model.push(getOpenItem(item));

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.openPDF))
      model.push(getOpenPDFItem(item));

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.preview))
      model.push(getPreviewItem(item));

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.copyLink))
      model.push(getLinkForRoomMembersItem(item));

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.download))
      model.push(getDownloadItem(item));

    if (contextOptions.includes(AVAILABLE_CONTEXT_ITEMS.downloadAs))
      model.push(getDownloadAsItem(item));

    return model;
  }, [item]);

  return { getContextMenuModel };
}
