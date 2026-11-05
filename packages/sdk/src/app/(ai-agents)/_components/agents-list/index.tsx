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

// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import type { TAgent } from "@docspace/shared/api/ai/types";
import { RoomsType } from "@docspace/shared/enums";
import { TagManagement } from "@docspace/shared/components/tag-management";
import type { AccessTagManagement } from "@docspace/shared/components/tag-management";
import { ShareAccessRights } from "@onlyoffice/apps-ui-kit/enums";

import { Button } from "@onlyoffice/apps-ui-kit/components/button";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { RoomTile } from "@onlyoffice/apps-ui-kit/components/tiles/room-tile";
import { TileContainer } from "@onlyoffice/apps-ui-kit/components/tiles/tile-container";
import { Row } from "@onlyoffice/apps-ui-kit/components/rows/row";
import { RowContent } from "@onlyoffice/apps-ui-kit/components/rows/row-content";
import { RowContainer } from "@onlyoffice/apps-ui-kit/components/rows/row-container";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";

import { useAgentsListStore, useAgentsUserStore } from "../../_store";
import { formatCreated } from "../../_helpers/formatCreated";
import AgentsEmptyView from "../agents-empty-view";
import AgentsEmptyFilter from "../agents-empty-filter";
import AgentsSectionEmptyView, {
  type AgentsListSection,
} from "../agents-section-empty-view";
import useAgentContextOptions from "./useAgentContextOptions";
import AgentsTable from "./AgentsTable";
import styles from "./AgentsList.module.scss";

// Mirror client TagManagement wrapper: derive granular access flags from the
// agent's `access` ShareAccessRights value + the viewer's admin status.
const computeTagAccess = (
  access: ShareAccessRights | undefined,
  isAdmin: boolean,
): AccessTagManagement => {
  const isRoomManager = access === ShareAccessRights.RoomManager;
  const isRoomOwner =
    access === ShareAccessRights.None ||
    access === ShareAccessRights.FullAccess;
  const canCreate = isAdmin || isRoomOwner || isRoomManager;
  return {
    canEdit: isAdmin,
    canRemove: isAdmin,
    canCreate,
    canBindTag: canCreate,
    canSearch: canCreate,
  };
};

// Mirror client `getRoomTypeName` but localized to the keys we ship in the SDK.
// AI agents are always AIRoom — keep the lookup minimal but typed compatibly
// with the ui-kit RoomTile contract (string label).
const getRoomTypeName = (
  _type: string,
  t: (key: string, interpolation?: Record<string, string | number>) => string,
) => t("Common:AIRoomTitle", { defaultValue: "AI agent" });

type Props = {
  agents: TAgent[];
  /**
   * When set, the empty-state branch renders the section-specific empty
   * screen (Shared / Recent / Favorites / Trash) instead of the default
   * "create an agent" copy used on the root listing.
   */
  section?: AgentsListSection;
};

const AgentsList = observer(({ agents, section }: Props) => {
  const router = useRouter();
  const { t } = useTranslation(["Common", "Files"]);
  const store = useAgentsListStore();
  const userStore = useAgentsUserStore();
  const isAdmin = !!(userStore.user?.isAdmin || userStore.user?.isOwner);
  const getContextOptions = useAgentContextOptions();

  const goToAgent = React.useCallback(
    (id: TAgent["id"]) => {
      router.push(`/ai-agents/${id}?tab=chat`);
    },
    [router],
  );

  if (!agents.length) {
    const f = store.filter;
    const hasFilter = !!(
      f.filterValue ||
      f.subjectId ||
      f.subjectFilter ||
      (f.tags && f.tags.length > 0)
    );
    if (hasFilter) return <AgentsEmptyFilter />;
    if (section) return <AgentsSectionEmptyView section={section} />;
    return <AgentsEmptyView />;
  }

  const hasMore = agents.length < store.total;
  const loadMore = hasMore ? (
    <div className={styles.loadMore}>
      <Button
        label={t("Common:ShowMore", { defaultValue: "Show more" })}
        onClick={() => {
          void store.fetchMore();
        }}
        isDisabled={store.isLoading}
        isLoading={store.isLoading}
      />
    </div>
  ) : null;

  // ---------- Tile view ----------
  // Mirrors `client/.../TilesView/FileTile.js` "isRoom" branch: RoomTile with
  // a RoomIcon element built from item.logo (cover/color/medium). We don't
  // need the FilesStore selection wiring — omitting `onSelect` hides the
  // checkbox the same way uncovered ui-kit tiles do.
  if (store.viewAs === "tile") {
    return (
      <>
        <TileContainer useReactWindow={false} className={styles.tilesGrid}>
          {agents.map((agent) => {
            const options = getContextOptions(agent);
            const logo = agent.logo;
            const showDefault = !(logo?.cover || logo?.medium);
            const element = (
              <RoomIcon
                title={agent.title}
                color={logo?.color}
                logo={logo}
                size="32px"
                radius="6px"
                showDefault={showDefault}
                imgClassName="react-svg-icon"
              />
            );
            return (
              <RoomTile
                key={agent.id}
                item={{
                  id: agent.id,
                  title: agent.title,
                  logo: {
                    small: logo?.small,
                    cover:
                      typeof logo?.cover === "object"
                        ? logo?.cover?.data
                        : undefined,
                    color: logo?.color,
                  },
                  roomType: String(RoomsType.AIRoom),
                  tags: agent.tags ?? [],
                  // `isRoom` is what TileContainer reads to bucket the tile
                  // into the Rooms grid (with the proper card/grid layout).
                  isRoom: true,
                  // `isAIAgent` makes RoomTile render the "No tags"
                  // placeholder pill in the bottom row, matching the
                  // client-side look for AI-agent tiles.
                  isAIAgent: true,
                  contextOptions: options,
                }}
                element={element}
                contextOptions={options}
                // BaseTile gates the `cmRef.current.show(e)` call on
                // `getContextModel` being passed — without it the kebab
                // renders but clicking does nothing.
                getContextModel={() => options}
                // Multi-selection — `checked` shows the checkbox in the
                // overlay state; `onSelect` toggles the agent's selection
                // in AgentsListStore.
                checked={store.isSelected(agent.id)}
                onSelect={() => store.toggleAgentSelection(agent)}
                columnCount={1}
                selectTag={() => {}}
                selectOption={() => {}}
                getRoomTypeName={getRoomTypeName}
                thumbnailClick={() => goToAgent(agent.id)}
                // Mirror client FileTile — render TagManagement in the bottom
                // row so the hover-state "+" button appears for creating /
                // assigning tags. `isActive || isHovered` (provided by
                // RoomTile) shows the create-tag affordance.
                customBottomContent={(isHovered, tags) => (
                  <TagManagement
                    id={agent.id}
                    tags={tags}
                    roomName={agent.title}
                    columnCount={1}
                    access={computeTagAccess(agent.access, isAdmin)}
                    onSelectTag={() => {}}
                    isActive={isHovered}
                  />
                )}
              >
                {/* topContent slot — just the title; bottom row is the
                    auto-rendered "No tags" placeholder from RoomTile. */}
                <Link
                  type={LinkType.page}
                  title={agent.title}
                  fontWeight={600}
                  fontSize="14px"
                  truncate
                  isTextOverflow
                  onClick={() => goToAgent(agent.id)}
                >
                  {agent.title}
                </Link>
              </RoomTile>
            );
          })}
        </TileContainer>
        {loadMore}
      </>
    );
  }

  // ---------- Row view ----------
  // Mirrors `client/.../RowsView/SimpleFilesRow.js`: Row in "modern" mode,
  // `element` = RoomIcon (32px) just like ItemIcon wraps it, RowContent with
  // a primary Link and a secondary meta cell.
  if (store.viewAs === "row") {
    return (
      <>
        <RowContainer useReactWindow={false} itemHeight={48}>
          {agents.map((agent) => {
            const options = getContextOptions(agent);
            const logo = agent.logo;
            const showDefault = !(logo?.cover || logo?.medium);
            const element = (
              <RoomIcon
                title={agent.title}
                color={logo?.color}
                logo={logo}
                size="32px"
                radius="6px"
                showDefault={showDefault}
                imgClassName="react-svg-icon"
              />
            );

            return (
              <Row
                key={agent.id}
                mode="modern"
                isRoom
                element={element}
                contextOptions={options}
                getContextModel={() => options}
                checked={store.isSelected(agent.id)}
                onSelect={() => store.toggleAgentSelection(agent)}
                onRowClick={() => goToAgent(agent.id)}
                item={{
                  title: agent.title,
                  logo: {
                    medium: logo?.medium,
                    small: logo?.small,
                    color: logo?.color,
                  },
                }}
              >
                <RowContent sideColor="var(--text-color)">
                  <Link
                    className="row-content-link"
                    type={LinkType.page}
                    title={agent.title}
                    fontWeight={600}
                    fontSize="15px"
                    truncate
                    isTextOverflow
                    onClick={() => goToAgent(agent.id)}
                  >
                    {agent.title}
                  </Link>
                  <></>
                  <Text
                    fontSize="12px"
                    fontWeight={400}
                    className="row_update-text"
                  >
                    {formatCreated(agent.created)}
                  </Text>
                </RowContent>
              </Row>
            );
          })}
        </RowContainer>
        {loadMore}
      </>
    );
  }

  // ---------- Table view ----------
  return (
    <>
      <AgentsTable agents={agents} goToAgent={goToAgent} />
      {loadMore}
    </>
  );
});

export default AgentsList;
