// (c) Copyright Ascensio System SIA 2009-2025
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
import React from "react";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

import { RoomIcon } from "@docspace/shared/components/room-icon";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";

import FolderLocationIconSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import config from "PACKAGE_FILE";

import { StyledFileItem } from "../NewFilesBadge.styled";
import {
  NewFilesPanelItemFileInjectStore,
  NewFilesPanelItemFileProps,
} from "../NewFilesBadge.types";

const NewFilesPanelItemFileComponent = ({
  item,
  isRooms,
  onClose,

  getIcon,
  checkAndOpenLocationAction,
  markAsRead,
  openItemAction,

  displayFileExtension,
}: NewFilesPanelItemFileProps) => {
  const icon = getIcon?.(24, item.fileExst);

  const onOpenFileLocation = () => {
    checkAndOpenLocationAction!(item);
    onClose();
  };

  const onClick = async () => {
    const isMedia =
      item.viewAccessibility.ImageView || item.viewAccessibility.MediaView;

    if (isMedia) {
      return window.open(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          config.homepage,
          MEDIA_VIEW_URL,
          item.id,
        ),
      );
    }

    openItemAction!({ ...item });
    markAsRead!([], [item.id]);

    onClose();
  };

  return (
    <StyledFileItem isRooms={isRooms}>
      <div className="info-container" onClick={onClick}>
        <RoomIcon
          className="file-icon"
          logo={icon!}
          showDefault={false}
          title={item.title}
        />
        <Text
          noSelect
          truncate
          fontSize="12px"
          fontWeight={600}
          lineHeight="16px"
        >
          {item.title.replace(item.fileExst, "")}
          {displayFileExtension ? (
            <span className="file-exst">{item.fileExst}</span>
          ) : null}
        </Text>
      </div>
      <IconButton
        className="open-location-button"
        iconName={FolderLocationIconSvgUrl}
        size={16}
        onClick={onOpenFileLocation}
      />
    </StyledFileItem>
  );
};

export const NewFilesPanelItemFile = inject(
  ({
    filesSettingsStore,
    filesActionsStore,
    filesStore,
  }: NewFilesPanelItemFileInjectStore) => {
    const { displayFileExtension, getIcon } = filesSettingsStore;
    const { checkAndOpenLocationAction, markAsRead, openItemAction } =
      filesActionsStore;
    const { openDocEditor } = filesStore;

    return {
      displayFileExtension,
      getIcon,
      checkAndOpenLocationAction,
      markAsRead,
      openDocEditor,
      openItemAction,
    };
  },
)(observer(NewFilesPanelItemFileComponent));
