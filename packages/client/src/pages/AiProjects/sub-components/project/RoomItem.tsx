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

import type React from "react";
import classNames from "classnames";
import { useNavigate } from "react-router";

import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";
import type { TAiProjectLogo } from "@docspace/shared/api/ai/projects";

import ExpanderDownIcon from "PUBLIC_DIR/images/expander-down.react.svg";

import { coverLogo } from "../list/ProjectLogo";
import styles from "./ProjectSources.module.scss";

type RoomItemProps = {
  id: number | string;
  title: string;
  logo?: TAiProjectLogo;
  /** Drawn while the room carries no logo. */
  icon: "instructionsRoom.svg" | "knowledgeRoom.svg" | "folder.svg";
  /** Called before the room opens, e.g. to close the aside the item sits in. */
  onOpen?: () => void;
  /** Opens the item instead of the room route, e.g. a folder through Files. */
  onClick?: () => void;
  /** Tooltip of the name, e.g. the folder's path. */
  hint?: string;
  /** With `onToggle`, an expander before the room, as the folder tree draws one. */
  isExpanded?: boolean;
  onToggle?: () => void;
  /** Drawn at the end of the row, e.g. a warning badge; a click on it does not open the room. */
  trailing?: React.ReactNode;
};

/** A linked room as the new-files panel draws one; a click opens the room. */
const RoomItem = ({
  id,
  title,
  logo,
  icon,
  onOpen,
  onClick: onOpenItem,
  hint,
  isExpanded,
  onToggle,
  trailing,
}: RoomItemProps) => {
  const navigate = useNavigate();
  const color = logo?.color.replace("#", "") ?? "";

  const onClick = (e: React.MouseEvent) => {
    // Inside an expandable row the rest of the row toggles; the room itself opens.
    e.stopPropagation();
    onOpen?.();
    if (onOpenItem) onOpenItem();
    // The address Files opens a room by; without `folder` the room id is lost.
    else navigate(`/rooms/shared/${id}/filter?folder=${id}`);
  };

  const item = (
    <div className={styles.roomItem} onClick={onClick} data-testid={`ai-project-room-${id}`}>
      <RoomIcon
        className="room-icon"
        imgClassName="room-image"
        logo={logo ? (logo.cover ? coverLogo(logo.cover, color) : logo.medium) : (iconSize32.get(icon) ?? "")}
        title={title}
        color={color}
        showDefault={logo ? !logo.cover && !logo.medium : false}
        dropDownManualX="0"
        size="24px"
      />
      <Text className="room-item-title" fontSize="13px" fontWeight={600} lineHeight="15px" title={hint ?? title} truncate noSelect>
        {title}
      </Text>
      {trailing ? (
        <span className={styles.roomTrailing} onClick={(e) => e.stopPropagation()}>
          {trailing}
        </span>
      ) : null}
    </div>
  );

  if (!onToggle) return item;

  return (
    // The whole row, past the room's own logo and title, toggles: a target
    // the size of the row rather than of the triangle, for touch.
    <div className={styles.roomItemRow} onClick={onToggle}>
      <button
        type="button"
        className={classNames(styles.expander, { [styles.expanded]: isExpanded })}
        aria-expanded={isExpanded}
        aria-label={title}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        data-testid={`ai-project-room-expander-${id}`}
      >
        <ExpanderDownIcon aria-hidden="true" />
      </button>
      {item}
    </div>
  );
};

export default RoomItem;
