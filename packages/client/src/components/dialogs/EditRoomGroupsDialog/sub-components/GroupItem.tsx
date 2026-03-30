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
