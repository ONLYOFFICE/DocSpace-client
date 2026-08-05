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

import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { ButtonKeys } from "@docspace/shared/enums";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import { IconButton } from "@docspace/ui-kit/components/icon-button";

import type { GroupItemProps } from "../EditRoomGroupsDialog.types";
import styles from "../EditRoomGroupsDialog.module.scss";

const GroupItem = ({
  group,
  onClickGroup,
  onClickEditIcon,
  onClickDeleteGroup,
  disabled,
}: GroupItemProps) => {
  const { t } = useTranslation(["Common"]);

  const iconData = group?.icon?.data.small;

  const handleGroupClick = () => {
    if (!disabled && onClickGroup) {
      onClickGroup(group.id);
    }
  };

  const handleEditClick = () => {
    if (!disabled && onClickEditIcon) {
      onClickEditIcon(group.id);
    }
  };

  const handleDeleteClick = () => {
    if (!disabled && onClickDeleteGroup) {
      onClickDeleteGroup(group.id);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === ButtonKeys.enter) {
      e.preventDefault();
      handler();
    }
  };

  return (
    <div className={styles.addedGroups} data-testid={`group_item_${group.id}`}>
      <div
        className={`${styles.group} ${disabled ? styles.groupDisabled : ""}`}
      >
        <div
          className={styles.groupData}
          onClick={handleGroupClick}
          onKeyDown={(e) => onKeyDown(e, handleGroupClick)}
          style={disabled ? { cursor: "default" } : undefined}
          tabIndex={disabled ? -1 : 0}
          role="button"
          data-testid={`group_item_${group.id}_button`}
        >
          <div className={styles.iconGroup}>
            {iconData && (
              <ReactSVG
                src={`data:image/svg+xml;utf8,${encodeURIComponent(iconData)}`}
              />
            )}
          </div>
          <div className={styles.titleContainer}>
            <div className={styles.nameGroup}>{group.name}</div>
            <div className={styles.countRooms}>
              {group.totalRooms} {t("Common:Rooms")}
            </div>
          </div>
        </div>

        <div className={styles.editGroup}>
          <IconButton
            className="edit_icon"
            iconName={PencilReactSvgUrl}
            size={16}
            onClick={handleEditClick}
            onKeyDown={(e) => onKeyDown(e, handleEditClick)}
            isDisabled={disabled}
            tabIndex={disabled ? -1 : 0}
            dataTestId="edit_group_icon_button"
          />
          <IconButton
            className="delete_icon"
            iconName={TrashReactSvgUrl}
            size={16}
            onClick={handleDeleteClick}
            onKeyDown={(e) => onKeyDown(e, handleDeleteClick)}
            isDisabled={disabled}
            tabIndex={disabled ? -1 : 0}
            dataTestId="delete_group_icon_button"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupItem;
