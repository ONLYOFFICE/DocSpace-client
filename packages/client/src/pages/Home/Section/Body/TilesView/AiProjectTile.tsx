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
import { ReactSVG } from "react-svg";

import { BaseTile } from "@onlyoffice/apps-ui-kit/components/tiles/base-tile";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";

import { useStore } from "SRC_DIR/store/useStore";

import ChatReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-chat-bubble.react.svg?url";
import SkillSetReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import KnowledgeReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";

import styles from "./AiProjectTile.module.scss";

const DASH = "\u2014";

/** How many linked rooms of a kind a card names; the rest it counts. */
const SHOWN_SOURCES = 2;

/** The linked rooms of a kind a card names, and how many more it counts as "+N". */
export const getShownSources = (names: string[] = []) => ({
  shown: names.slice(0, SHOWN_SOURCES),
  rest: Math.max(0, names.length - SHOWN_SOURCES),
});

type TBaseTileProps = React.ComponentProps<typeof BaseTile>;

type AiProjectTileProps = Omit<TBaseTileProps, "topContent" | "bottomContent" | "className" | "onRoomClick"> & {
  /** Opens the project, on its chat: a click anywhere on the tile but its controls, or Open chat. */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Opens the owner's profile, from the owner's name. */
  openUser?: () => void;
  /** Badges beside the title, in the upper half. */
  badges?: React.ReactNode;
  /** The tile's content; only the first element is rendered, above the badges. */
  children?: React.ReactNode;
};

/** The parts of the tile a click on which is theirs, not the project's. */
const CONTROLS =
  ".checkbox, .badges, .expandButton, .p-contextmenu, #modal-dialog, .ai-project-tile-owner, .ai-project-tile-open-chat";

/**
 * An AI project (an agent) in the tile view, laid out as a room template's
 * tile: the logo and the name above, and below them its category (its first
 * tag, when it has one), what the project is made of - its model, its skill
 * sets and its knowledge bases - and its owner. The list answers the rooms
 * without those settings, so the tile reads its own summary once and shows a
 * dash until it lands.
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

  // An agent without a model of its own runs on the portal's chat model.
  const model = (summary && (summary.model ?? aiProjectsStore.defaultModelName)) || DASH;

  const { createdBy, tags, inRoom, title } = item as {
    createdBy?: { displayName?: string };
    tags?: string[];
    inRoom?: boolean;
    title?: string;
  };
  const owner = createdBy?.displayName;
  // An agent's category is its first tag, as the list's category row reads it.
  const category = tags?.[0];

  const text = (key: string, value: string) => (
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
  );

  // The linked rooms of a kind, one per line with the kind's icon: the
  // first two, then how many more. A kind with none shows a dash.
  const sources = (key: string, icon: string, names: string[] | undefined) => {
    if (!names?.length) return text(key, DASH);
    const { shown, rest } = getShownSources(names);
    return (
      <div className={`${styles.value} ${styles.sources}`} data-testid={`ai-project-tile-${key}`}>
        {shown.map((name, index) => (
          // Two linked rooms may share a title.
          <div key={`${index}-${name}`} className={styles.source} data-testid={`ai-project-tile-${key}-item`}>
            <ReactSVG src={icon} className={styles.icon} />
            <Text truncate fontSize="13px" fontWeight={600} title={name} dir="auto">
              {name}
            </Text>
          </div>
        ))}
        {rest ? (
          <Text fontSize="13px" fontWeight={600} className={styles.more} data-testid={`ai-project-tile-${key}-more`}>
            {`+${rest}`}
          </Text>
        ) : null}
      </div>
    );
  };

  const rows = [
    ...(category ? [{ key: "category", label: t("Common:Category"), value: text("category", category) }] : []),
    { key: "model", label: t("Common:AIAgentModel"), value: text("model", model) },
    { key: "skills", label: t("Common:SkillSets"), value: sources("skills", SkillSetReactSvgUrl, summary?.skills) },
    {
      key: "knowledge",
      label: t("Common:AIProjectKnowledgeRooms"),
      value: sources("knowledge", KnowledgeReactSvgUrl, summary?.knowledge),
    },
  ];

  // Only a member chats with the agent: a DocSpace admin sees every agent of
  // the portal but chats only in the ones they belong to.
  const openChat = inRoom ? (
    <div className={`${styles.openChat} ai-project-tile-open-chat not-selectable`}>
      <IconButton
        iconName={ChatReactSvgUrl}
        size={16}
        isFill
        title={t("Common:OpenChatWith", { name: title })}
        onClick={thumbnailClick}
        dataTestId="ai-project-tile-open-chat"
      />
    </div>
  ) : null;

  const bottomContent = (
    <div className={styles.wrapper} data-testid="ai-project-tile-summary">
      {rows.map(({ key, label, value }) => (
        <React.Fragment key={key}>
          <Text truncate fontSize="13px" fontWeight={400} className={styles.label}>
            {label}
          </Text>
          {value}
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
          {openChat}
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
