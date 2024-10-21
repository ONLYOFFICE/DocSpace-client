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

import moment from "moment";
import { useState } from "react";
import copy from "copy-to-clipboard";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import OutlineReactSvgUrl from "PUBLIC_DIR/images/outline-true.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

import { RoomsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { copyRoomShareLink } from "@docspace/shared/components/share/Share.helpers";
import LinkRowComponent from "@docspace/shared/components/share/sub-components/LinkRow";

import type { TTranslation } from "@docspace/shared/types";
import type { TFileLink } from "@docspace/shared/api/files/types";
import type { TOption } from "@docspace/shared/components/combobox";

type LinkRowProps = {
  t: TTranslation;
  link: TFileLink;
  roomId: string | number;
  setLinkParams: (linkParams: {
    roomId: number | string;
    isEdit?: boolean;
    link: TFileLink;
    isPublic?: boolean;
    isFormRoom?: boolean;
    isCustomRoom?: boolean;
  }) => void;
  setEditLinkPanelIsVisible: (value: boolean) => void;
  setDeleteLinkDialogVisible: (value: boolean) => void;
  setEmbeddingPanelData: (value: {
    visible: boolean;
    itemId?: string | number;
  }) => void;

  isArchiveFolder: boolean;
  setIsScrollLocked: (isScrollLocked: boolean) => void;
  isPublicRoomType: boolean;
  isFormRoom: boolean;
  isPrimaryLink: boolean;
  isCustomRoom: boolean;
  setExternalLink: (link: TFileLink) => void;
  editExternalLink: (
    roomId: string | number,
    link: TFileLink,
  ) => Promise<TFileLink>;
};

const LinkRow = (props: LinkRowProps) => {
  const {
    t,
    link,
    roomId,
    setLinkParams,
    setEditLinkPanelIsVisible,
    setDeleteLinkDialogVisible,
    setEmbeddingPanelData,
    isArchiveFolder,
    setIsScrollLocked,
    isPublicRoomType,
    isFormRoom,
    isCustomRoom,
    isPrimaryLink,
    editExternalLink,
    setExternalLink,
  } = props;

  const { shareLink, password, isExpired, primary } = link.sharedTo;

  const isLocked = !!password;
  const isDisabled = isExpired;

  const [loadingLinks, setLoadingLinks] = useState<(string | number)[]>([]);

  const onCloseContextMenu = () => {
    setIsScrollLocked(false);
  };

  const onEditLink = () => {
    setEditLinkPanelIsVisible(true);
    setLinkParams({
      isEdit: true,
      link,
      roomId,
      isPublic: isPublicRoomType,
      isFormRoom,
    });
    onCloseContextMenu();
  };

  const onCopyPassword = () => {
    if (password) {
      copy(password);
      toastr.success(t("Files:PasswordSuccessfullyCopied"));
    }
  };

  const onEmbeddingClick = () => {
    setLinkParams({ link, roomId, isPublic: isPublicRoomType, isFormRoom });
    setEmbeddingPanelData({ visible: true });
    onCloseContextMenu();
  };

  const onDeleteLink = () => {
    setLinkParams({
      link,
      roomId,
      isPublic: isPublicRoomType,
      isFormRoom,
      isCustomRoom,
    });
    setDeleteLinkDialogVisible(true);
    onCloseContextMenu();
  };

  const onCopyExternalLink = () => {
    // copy(shareLink);
    copyRoomShareLink(link, t);
    onCloseContextMenu();
  };

  const onOpenContextMenu = () => {
    setIsScrollLocked(true);
  };

  const getData = () => {
    return [
      {
        key: "edit-link-key",
        label: t("Files:LinkSettings"),
        icon: SettingsReactSvgUrl,
        onClick: onEditLink,
      },
      {
        key: "copy-link-settings-key",
        label: t("Files:CopySharedLink"),
        icon: CopyToReactSvgUrl,
        onClick: onCopyExternalLink,
        disabled: isDisabled,
      },
      {
        key: "copy-link-password-key",
        label: t("Files:CopyLinkPassword"),
        icon: LockedReactSvgUrl,
        onClick: onCopyPassword,
        disabled: isDisabled || !isLocked,
      },
      {
        key: "embedding-settings-key",
        label: t("Files:Embed"),
        icon: CodeReactSvgUrl,
        onClick: onEmbeddingClick,
        disabled: isDisabled,
      },
      {
        key: "delete-link-separator",
        isSeparator: true,
      },
      {
        key: "delete-link-key",
        label:
          primary && isPublicRoomType
            ? t("Files:RevokeLink")
            : t("Common:Delete"),
        icon:
          primary && isPublicRoomType ? OutlineReactSvgUrl : TrashReactSvgUrl,
        onClick: onDeleteLink,
      },
    ];
  };

  const editExternalLinkAction = (newLink: TFileLink) => {
    setLoadingLinks([newLink.sharedTo.id]);

    editExternalLink(roomId, newLink)
      .then((linkData: TFileLink) => {
        setExternalLink(linkData);
        setLinkParams({
          link: linkData,
          roomId,
          isPublic: isPublicRoomType,
          isFormRoom,
        });

        // copy(link?.sharedTo?.shareLink);

        if (linkData) {
          copyRoomShareLink(linkData, t);
        }

        // toastr.success(t("Files:LinkEditedSuccessfully"));
      })
      .catch((err: Error) => toastr.error(err?.message))
      .finally(() => setLoadingLinks([]));
  };

  const onAccessRightsSelect = (opt: TOption) => {
    const newLink = { ...link };
    if (opt.access) newLink.access = opt.access;
    editExternalLinkAction(newLink);
  };

  const changeExpirationOption = async (
    linkData: TFileLink,
    expirationDate: moment.Moment | null,
  ) => {
    const newLink = { ...link };
    newLink.sharedTo.expirationDate = expirationDate
      ? moment(expirationDate)
      : null;
    editExternalLinkAction(newLink);
  };

  return (
    <LinkRowComponent
      loadingLinks={loadingLinks}
      links={[link]}
      getData={getData}
      onOpenContextMenu={onOpenContextMenu}
      onCloseContextMenu={onCloseContextMenu}
      isRoomsLink
      isPrimaryLink={isPrimaryLink}
      onAccessRightsSelect={onAccessRightsSelect}
      changeExpirationOption={changeExpirationOption}
      isArchiveFolder={isArchiveFolder}
    />
  );
};

export default inject<TStore>(
  ({
    settingsStore,
    dialogsStore,
    treeFoldersStore,
    infoPanelStore,
    publicRoomStore,
  }) => {
    const { infoPanelSelection } = infoPanelStore;
    const { theme } = settingsStore;

    const {
      setEditLinkPanelIsVisible,
      setDeleteLinkDialogVisible,
      setEmbeddingPanelData,
      setLinkParams,
    } = dialogsStore;
    const { isArchiveFolderRoot } = treeFoldersStore;

    const { id, roomType } = infoPanelSelection!;

    const { editExternalLink, setExternalLink } = publicRoomStore;

    return {
      setLinkParams,
      roomId: id,
      setEditLinkPanelIsVisible,
      setDeleteLinkDialogVisible,
      setEmbeddingPanelData,
      isArchiveFolder: isArchiveFolderRoot,
      theme,
      isPublicRoomType:
        roomType === RoomsType.PublicRoom || roomType === RoomsType.FormRoom,
      isFormRoom: roomType === RoomsType.FormRoom,
      isCustomRoom: roomType === RoomsType.CustomRoom,
      editExternalLink,
      setExternalLink,
    };
  },
)(
  withTranslation(["SharingPanel", "Files", "Settings", "Translations"])(
    observer(LinkRow),
  ),
);
