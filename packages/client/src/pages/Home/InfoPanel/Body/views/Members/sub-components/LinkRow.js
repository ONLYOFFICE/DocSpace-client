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

import React, { useState } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import copy from "copy-to-clipboard";
import { Avatar } from "@docspace/shared/components/avatar";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { toastr } from "@docspace/shared/components/toast";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.reat.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import OutlineReactSvgUrl from "PUBLIC_DIR/images/outline-true.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/locked.react.svg?url";
import LoadedReactSvgUrl from "PUBLIC_DIR/images/loaded.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import ClockReactSvg from "PUBLIC_DIR/images/clock.react.svg";
import moment from "moment-timezone";
import { RoomsType } from "@docspace/shared/enums";

import { StyledLinkRow } from "./Styled";

const LinkRow = (props) => {
  const {
    t,
    link,
    roomId,
    setLinkParams,
    setExternalLink,
    editExternalLink,
    setEditLinkPanelIsVisible,
    setDeleteLinkDialogVisible,
    setEmbeddingPanelIsVisible,
    isArchiveFolder,
    theme,
    setIsScrollLocked,
    isPublicRoomType,
    ...rest
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const {
    title,
    shareLink,
    password,
    disabled,
    expirationDate,
    isExpired,
    primary,
  } = link.sharedTo;

  const isLocked = !!password;
  const expiryDate = !!expirationDate;
  const date = moment(expirationDate).tz(window.timezone).format("LLL");

  const tooltipContent = isExpired
    ? t("Translations:LinkHasExpiredAndHasBeenDisabled")
    : t("Translations:PublicRoomLinkValidTime", { date });

  const onEditLink = () => {
    setEditLinkPanelIsVisible(true);
    setLinkParams({ isEdit: true, link });
    onCloseContextMenu();
  };

  const onDisableLink = () => {
    if (isExpired) {
      setEditLinkPanelIsVisible(true);
      setLinkParams({ isEdit: true, link });
      return;
    }

    setIsLoading(true);

    const newLink = JSON.parse(JSON.stringify(link));
    newLink.sharedTo.disabled = !newLink.sharedTo.disabled;

    editExternalLink(roomId, newLink)
      .then((link) => {
        setExternalLink(link);

        disabled
          ? toastr.success(t("Files:LinkEnabledSuccessfully"))
          : toastr.success(t("Files:LinkDisabledSuccessfully"));
      })
      .catch((err) => toastr.error(err?.message))
      .finally(() => setIsLoading(false));
  };

  const onCopyPassword = () => {
    copy(password);
    toastr.success(t("Files:PasswordSuccessfullyCopied"));
  };

  const onEmbeddingClick = () => {
    setLinkParams({ link, roomId });
    setEmbeddingPanelIsVisible(true);
    onCloseContextMenu();
  };

  const onDeleteLink = () => {
    setLinkParams({ link });
    setDeleteLinkDialogVisible(true);
    onCloseContextMenu();
  };

  const onCopyExternalLink = () => {
    copy(shareLink);
    toastr.success(t("Common:LinkSuccessfullyCopied"));
    onCloseContextMenu();
  };

  const onOpenContextMenu = () => {
    setIsScrollLocked(true);
  };

  const onCloseContextMenu = () => {
    setIsScrollLocked(false);
  };

  const getData = () => {
    return [
      {
        key: "edit-link-key",
        label: t("Files:LinkSettings"),
        icon: SettingsReactSvgUrl,
        onClick: onEditLink,
      },
      // {
      //   key: "edit-link-separator",
      //   isSeparator: true,
      // },
      // {
      //   key: "share-key",
      //   label: t("Files:Share"),
      //   icon: ShareReactSvgUrl,
      //   // onClick: () => args.onClickLabel("label2"),
      // },
      // !isExpired && {
      //   key: "embedding-settings-key",
      //   label: t("Files:EmbeddingSettings"),
      //   icon: CodeReactSvgUrl,
      //   onClick: onEmbeddingClick,
      // },

      !disabled &&
        !isExpired && {
          key: "copy-link-settings-key",
          label: t("Files:CopySharedLink"),
          icon: CopyToReactSvgUrl,
          onClick: onCopyExternalLink,
        },

      // disabled
      //   ? {
      //       key: "enable-link-key",
      //       label: t("Files:EnableLink"),
      //       icon: LoadedReactSvgUrl,
      //       onClick: onDisableLink,
      //     }
      //   : {
      //       key: "disable-link-key",
      //       label: t("Files:DisableLink"),
      //       icon: OutlineReactSvgUrl,
      //       onClick: onDisableLink,
      //     },

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

  const textColor = disabled ? theme.text.disableColor : theme.text.color;

  return (
    <StyledLinkRow {...rest} isExpired={isExpired}>
      <Avatar
        size="min"
        source={LinkReactSvgUrl}
        roleIcon={
          expiryDate ? (
            <div className="clock-icon">
              <ClockReactSvg />
            </div>
          ) : null
        }
        withTooltip={expiryDate}
        tooltipContent={tooltipContent}
      />
      {isArchiveFolder ? (
        <Text fontSize="14px" fontWeight={600} className="external-row-link">
          {title}
        </Text>
      ) : (
        <Link
          isHovered
          type="action"
          fontSize="14px"
          fontWeight={600}
          onClick={onEditLink}
          isDisabled={disabled}
          color={textColor}
          className="external-row-link"
        >
          {title}
        </Link>
      )}

      {disabled && <Text color={textColor}>{t("Settings:Disabled")}</Text>}

      <div className="external-row-icons">
        {!disabled && !isExpired && !isArchiveFolder && (
          <>
            {isLocked && (
              <IconButton
                className="locked-icon"
                size={16}
                iconName={LockedReactSvgUrl}
                onClick={onCopyPassword}
                title={t("Files:CopyLinkPassword")}
              />
            )}
            <IconButton
              className="copy-icon"
              size={16}
              iconName={CopyReactSvgUrl}
              onClick={onCopyExternalLink}
              title={t("Files:CopySharedLink")}
            />
          </>
        )}

        {!isArchiveFolder && (
          <ContextMenuButton
            getData={getData}
            isDisabled={isLoading}
            title={t("Files:ShowLinkActions")}
            directionY="both"
            onClick={onOpenContextMenu}
            onClose={onCloseContextMenu}
          />
        )}
      </div>
    </StyledLinkRow>
  );
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    publicRoomStore,
    treeFoldersStore,
    infoPanelStore,
  }) => {
    const { infoPanelSelection } = infoPanelStore;
    const { theme } = settingsStore;

    const {
      setEditLinkPanelIsVisible,
      setDeleteLinkDialogVisible,
      setEmbeddingPanelIsVisible,
      setLinkParams,
    } = dialogsStore;
    const { editExternalLink, setExternalLink } = publicRoomStore;
    const { isArchiveFolderRoot } = treeFoldersStore;

    return {
      setLinkParams,
      editExternalLink,
      roomId: infoPanelSelection.id,
      setExternalLink,
      setEditLinkPanelIsVisible,
      setDeleteLinkDialogVisible,
      setEmbeddingPanelIsVisible,
      isArchiveFolder: isArchiveFolderRoot,
      theme,
      isPublicRoomType: infoPanelSelection.roomType === RoomsType.PublicRoom,
    };
  },
)(
  withTranslation(["SharingPanel", "Files", "Settings", "Translations"])(
    observer(LinkRow),
  ),
);
