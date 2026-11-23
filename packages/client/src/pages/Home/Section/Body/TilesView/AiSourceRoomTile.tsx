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

import React, { useCallback, useRef } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { BaseTile } from "@onlyoffice/apps-ui-kit/components/tiles/base-tile";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/shared/constants";
import { RoomsType } from "@docspace/shared/enums";

import { getUsedByText } from "SRC_DIR/helpers/usedByAgents";
import { useStore } from "SRC_DIR/store/useStore";
import KnowledgeBaseStatusBadge from "SRC_DIR/components/KnowledgeBaseStatusBadge";
import { useKnowledgeBaseStatus } from "SRC_DIR/components/KnowledgeBaseStatusBadge/useKnowledgeBaseStatus";

// The frame of the agent tile: the same halves, paddings and rows, as high
// as the rows a skill set or a knowledge base tells.
import styles from "./AiProjectTile.module.scss";

type TBaseTileProps = React.ComponentProps<typeof BaseTile>;

type TSourceRoom = {
  id: number | string;
  roomType?: RoomsType;
  filesCount?: number;
  linkedProjectsCount?: number;
  updated?: string;
  createdBy?: { displayName?: string };
};

type AiSourceRoomTileProps = Omit<
  TBaseTileProps,
  "topContent" | "bottomContent" | "className" | "onRoomClick"
> & {
  /** Opens the room: a click anywhere on the tile but its controls. */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Opens the owner's profile, from the owner's name. */
  openUser?: () => void;
  /** Badges beside the title, in the upper half. */
  badges?: React.ReactNode;
  /** The tile's content; only the first element is rendered, above the badges. */
  children?: React.ReactNode;
};

/** The parts of the tile a click on which is theirs, not the room's. */
const CONTROLS =
  ".checkbox, .badges, .expandButton, .p-contextmenu, #modal-dialog, .ai-source-room-tile-owner";

/**
 * A skill set or a knowledge base in the tile view, laid out as an agent's
 * tile and telling what the table's columns tell: the logo and the name
 * above - a knowledge base marked while its files are being indexed or when
 * some could not be - and below them how many skills a set holds, how many
 * agents use the room, the owner and when the room was last modified.
 */
const AiSourceRoomTile = ({
  item,
  children,
  badges,
  thumbnailClick,
  openUser,
  ...rest
}: AiSourceRoomTileProps) => {
  const { t } = useTranslation(["Common"]);
  const { culture, theme } = useStore("settingsStore");
  const checkboxContainerRef = useRef<HTMLDivElement>(null);

  const room = item as unknown as TSourceRoom;
  const isKnowledgeBase = room.roomType === RoomsType.KnowledgeRoom;
  const status = useKnowledgeBaseStatus(
    isKnowledgeBase ? { id: room.id, filesCount: room.filesCount } : null,
  );

  const onRoomClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target;
      if (
        target instanceof Element &&
        (target.closest(CONTROLS) ||
          checkboxContainerRef.current?.contains(target))
      )
        return;
      thumbnailClick?.(e);
    },
    [thumbnailClick],
  );

  const [content] = React.Children.toArray(children);

  const owner = room.createdBy?.displayName;
  const modified = room.updated
    ? getCorrectDate(getCookie(LANGUAGE) || culture, room.updated)
    : "";

  const label = (text: string) => (
    <Text truncate fontSize="13px" fontWeight={400} className={styles.label}>
      {text}
    </Text>
  );

  const value = (key: string, text: string) => (
    <Text
      truncate
      fontSize="13px"
      fontWeight={600}
      className={styles.value}
      title={text}
      dir="auto"
      data-testid={`ai-source-room-tile-${key}`}
    >
      {text}
    </Text>
  );

  const bottomContent = (
    <div className={styles.wrapper} data-testid="ai-source-room-tile-summary">
      {!isKnowledgeBase ? (
        <>
          {label(t("Common:Skills"))}
          {value("skills", String(room.filesCount ?? 0))}
        </>
      ) : null}
      {label(t("Common:UsedBy"))}
      {value("used-by", getUsedByText(t, room.linkedProjectsCount))}
      {label(t("Common:Owner"))}
      {owner ? (
        <Link
          isHovered
          truncate
          fontSize="13px"
          fontWeight={600}
          className={`${styles.value} ai-source-room-tile-owner`}
          title={owner}
          onClick={openUser}
          dataTestId="ai-source-room-tile-owner"
        >
          {owner}
        </Link>
      ) : (
        <span />
      )}
      {label(t("Common:LastModified"))}
      {value("modified", modified)}
    </div>
  );

  return (
    <BaseTile
      {...rest}
      item={item}
      topContent={
        <>
          {content}
          {status !== null ? (
            // Laid out as the other badges beside the title.
            <div className="badges">
              <KnowledgeBaseStatusBadge
                status={status}
                themeIsBase={theme?.isBase}
              />
            </div>
          ) : null}
          {badges}
        </>
      }
      bottomContent={bottomContent}
      className={`${styles.aiProjectTile} ${
        isKnowledgeBase ? styles.knowledgeBaseTile : styles.skillSetTile
      }`}
      onRoomClick={onRoomClick}
      checkboxContainerRef={checkboxContainerRef}
    />
  );
};

export default observer(AiSourceRoomTile);
