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

import React, { useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { BaseTile } from "@onlyoffice/apps-ui-kit/components/tiles/base-tile";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link } from "@onlyoffice/apps-ui-kit/components/link";

import { useStore } from "SRC_DIR/store/useStore";

import styles from "./AiProjectTile.module.scss";

type TBaseTileProps = React.ComponentProps<typeof BaseTile>;

type AiProjectTileProps = Omit<TBaseTileProps, "topContent" | "bottomContent" | "className" | "onRoomClick"> & {
  /** Opens the project: a click anywhere on the tile but its controls. */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Opens the owner's profile, from the owner's name. */
  openUser?: () => void;
  /** Badges beside the title, in the upper half. */
  badges?: React.ReactNode;
  /** The tile's content; only the first element is rendered, above the badges. */
  children?: React.ReactNode;
};

/** The parts of the tile a click on which is theirs, not the project's. */
const CONTROLS = ".checkbox, .badges, .expandButton, .p-contextmenu, #modal-dialog, .ai-project-tile-owner";

/**
 * An AI project (an agent) in the tile view, laid out as a room template's
 * tile: the logo and the name above, and below them what the project is made
 * of - its model, its skill sets and its knowledge bases - and its owner. The list answers
 * the rooms without those settings, so the tile reads its own summary once
 * and shows a dash until it lands.
 */
const AiProjectTile = ({ item, children, badges, thumbnailClick, openUser, ...rest }: AiProjectTileProps) => {
  const { t } = useTranslation(["Common"]);
  const aiProjectsStore = useStore("aiProjectsStore");
  const checkboxContainerRef = useRef<HTMLDivElement>(null);

  const id = Number(item.id);
  const summary = aiProjectsStore.tileSummaries[id];
  const { fetchTileSummary, tileSummariesRead } = aiProjectsStore;

  // Read again each time the list is.
  useEffect(() => {
    void fetchTileSummary(id);
  }, [fetchTileSummary, id, tileSummariesRead]);

  const onRoomClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target;
      if (
        target instanceof Element &&
        (target.closest(CONTROLS) || checkboxContainerRef.current?.contains(target))
      )
        return;
      thumbnailClick?.(e);
    },
    [thumbnailClick],
  );

  const [content] = React.Children.toArray(children);

  const list = (names: string[] | undefined) => (names?.length ? names.join(", ") : "\u2014");
  // An agent without a model of its own runs on the portal's chat model.
  const model = (summary && (summary.model ?? aiProjectsStore.defaultModelName)) || "\u2014";

  const owner = (item as { createdBy?: { displayName?: string } }).createdBy?.displayName;

  const rows = [
    { key: "model", label: t("Common:AIAgentModel"), value: model },
    { key: "skills", label: t("Common:SkillSets"), value: list(summary?.skills) },
    { key: "knowledge", label: t("Common:AIProjectKnowledgeRooms"), value: list(summary?.knowledge) },
  ];

  const bottomContent = (
    <div className={styles.wrapper} data-testid="ai-project-tile-summary">
      {rows.map(({ key, label, value }) => (
        <React.Fragment key={key}>
          <Text truncate fontSize="13px" fontWeight={400} className={styles.label}>
            {label}
          </Text>
          <Text
            truncate
            fontSize="13px"
            fontWeight={600}
            className={styles.value}
            title={value}
            dir="auto"
            data-testid={`ai-project-tile-${key}`}
          >
            {value}
          </Text>
        </React.Fragment>
      ))}
      <Text truncate fontSize="13px" fontWeight={400} className={styles.label}>
        {t("Common:Owner")}
      </Text>
      {owner ? (
        <Link
          isHovered
          truncate
          fontSize="13px"
          fontWeight={600}
          className={`${styles.value} ai-project-tile-owner`}
          title={owner}
          onClick={openUser}
          dataTestId="ai-project-tile-owner"
        >
          {owner}
        </Link>
      ) : (
        <span />
      )}
    </div>
  );

  return (
    <BaseTile
      {...rest}
      item={item}
      topContent={
        <>
          {content}
          {badges}
        </>
      }
      bottomContent={bottomContent}
      className={styles.aiProjectTile}
      onRoomClick={onRoomClick}
      checkboxContainerRef={checkboxContainerRef}
    />
  );
};

export default observer(AiProjectTile);
