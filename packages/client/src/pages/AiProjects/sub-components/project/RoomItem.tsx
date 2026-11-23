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

import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import ExpanderDownIcon from "PUBLIC_DIR/images/expander-down.react.svg";

import SkillIcon from "SRC_DIR/components/SkillIcon";

import styles from "./RoomItem.module.scss";

/** The kind of a linked room: a skill set or a knowledge base. */
type TSourceRoomIcon = "instructionsRoom.svg" | "knowledgeRoom.svg";

type RoomItemProps = {
  id: number | string;
  title: string;
  /** The kind of room, drawn with its own icon. */
  icon: TSourceRoomIcon;
  /** Called before the room opens, e.g. to close the aside the item sits in. */
  onOpen?: () => void;
  /** With `onToggle`, an expander before the room, as the folder tree draws one. */
  isExpanded?: boolean;
  onToggle?: () => void;
};

type SourceRoomLogoProps = {
  icon: TSourceRoomIcon;
  size?: string;
  className?: string;
};

const SKILL_ICON_KINDS: Record<TSourceRoomIcon, "set" | "knowledge"> = {
  "instructionsRoom.svg": "set",
  "knowledgeRoom.svg": "knowledge",
};

/**
 * A linked room's picture. A skill set and a knowledge base are drawn with
 * the skill set icon and the knowledge base icon, as the lists, the Info
 * panel and Details draw them: a logo stored for such a room is not shown.
 */
export const SourceRoomLogo = ({ icon, size = "24px", className }: SourceRoomLogoProps) => (
  <SkillIcon
    kind={SKILL_ICON_KINDS[icon]}
    size={Number.parseInt(size, 10)}
    className={classNames("room-icon", className)}
  />
);

/** A linked room as the new-files panel draws one; a click opens the room. */
const RoomItem = ({ id, title, icon, onOpen, isExpanded, onToggle }: RoomItemProps) => {
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent) => {
    // Inside an expandable row the rest of the row toggles; the room itself opens.
    e.stopPropagation();
    onOpen?.();
    // The address Files opens a room by; without `folder` the room id is lost.
    navigate(`/ai-rooms/${id}/filter?folder=${id}`);
  };

  const item = (
    <div className={styles.roomItem} onClick={onClick} data-testid={`ai-project-room-${id}`}>
      <SourceRoomLogo icon={icon} />
      <Text className="room-item-title" fontSize="13px" fontWeight={600} lineHeight="15px" title={title} truncate noSelect>
        {title}
      </Text>
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
