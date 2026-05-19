/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import FolderLocationIconSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import config from "PACKAGE_FILE";

import {
  NewFilesPanelItemFileInjectStore,
  NewFilesPanelItemFileProps,
} from "../NewFilesBadge.types";

import styles from "../new-files-panel.module.scss";

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

  const isFolder = !item.fileExst;

  const onClick = async () => {
    if (isFolder) {
      openItemAction!({ ...item, isFolder: true });
      markAsRead!([item.id], []);
      onClose();
      return;
    }

    const isMedia =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

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
    <div className={classNames(styles.fileItem, { [styles.isRooms]: isRooms })}>
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
    </div>
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
