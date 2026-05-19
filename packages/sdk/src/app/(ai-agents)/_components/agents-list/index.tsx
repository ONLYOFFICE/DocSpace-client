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

import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import { Button } from "@docspace/ui-kit/components/button";

import { useAgentsListStore } from "../../_store";
import { formatCreated } from "../../_helpers/formatCreated";
import AgentsEmptyView from "../agents-empty-view";
import AgentsEmptyFilter from "../agents-empty-filter";
import useAgentContextOptions from "./useAgentContextOptions";
import styles from "./AgentsList.module.scss";

const getInitials = (title: string) =>
  title
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

type Props = {
  agents: TAgent[];
};

const Avatar = ({
  agent,
  className,
}: {
  agent: TAgent;
  className: string;
}) => {
  const src = agent.logo?.medium || agent.logo?.small || agent.logo?.original;
  return (
    <div className={className} aria-hidden>
      {src ? (
        // biome-ignore lint/performance/noImgElement: avatar URL is dynamic; next/image not configured for remote API hosts
        <img src={src} alt="" />
      ) : (
        getInitials(agent.title || "?")
      )}
    </div>
  );
};

const AgentsList = observer(({ agents }: Props) => {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const store = useAgentsListStore();
  const getContextOptions = useAgentContextOptions();

  const goToAgent = (id: TAgent["id"]) => {
    router.push(`/ai-agents/${id}?tab=chat`);
  };

  // Prevent row navigation when the kebab/menu is clicked.
  const stopPropagation = (
    e: React.MouseEvent | React.KeyboardEvent,
  ) => e.stopPropagation();

  if (!agents.length) {
    const f = store.filter;
    const hasFilter = !!(
      f.filterValue ||
      f.subjectId ||
      f.subjectFilter ||
      (f.tags && f.tags.length > 0)
    );
    return hasFilter ? <AgentsEmptyFilter /> : <AgentsEmptyView />;
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

  if (store.viewAs === "tile") {
    return (
      <>
      <div className={styles.tilesGrid}>
        {agents.map((agent) => {
          const options = getContextOptions(agent);
          return (
            <button
              key={agent.id}
              type="button"
              className={styles.tile}
              onClick={() => goToAgent(agent.id)}
            >
              <div className={styles.tileHeader}>
                <Avatar agent={agent} className={styles.tileAvatar} />
                <div className={styles.tileTitle}>{agent.title}</div>
                {options.length > 0 ? (
                  <span
                    className={styles.tileMenu}
                    onClick={stopPropagation}
                    onKeyDown={stopPropagation}
                    role="presentation"
                  >
                    <ContextMenuButton
                      getData={() => options}
                      directionX="right"
                      isFill
                    />
                  </span>
                ) : null}
              </div>
              <div className={styles.tileMeta}>{formatCreated(agent.created)}</div>
            </button>
          );
        })}
      </div>
      {loadMore}
      </>
    );
  }

  if (store.viewAs === "row") {
    return (
      <>
      <div className={styles.rowList}>
        {agents.map((agent) => {
          const options = getContextOptions(agent);
          return (
            <div
              key={agent.id}
              className={styles.row}
              role="button"
              tabIndex={0}
              onClick={() => goToAgent(agent.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToAgent(agent.id);
              }}
            >
              <Avatar agent={agent} className={styles.tableAvatar} />
              <div className={styles.rowTitle}>{agent.title}</div>
              <div className={styles.rowMeta}>
                {formatCreated(agent.created)}
              </div>
              {options.length > 0 ? (
                <span
                  className={styles.rowMenu}
                  onClick={stopPropagation}
                  onKeyDown={stopPropagation}
                  role="presentation"
                >
                  <ContextMenuButton
                    getData={() => options}
                    directionX="right"
                    isFill
                  />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {loadMore}
      </>
    );
  }

  return (
    <>
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("Common:Name", { defaultValue: "Name" })}</th>
            <th>
              {t("Common:LastModifiedDate", {
                defaultValue: "Last modified date",
              })}
            </th>
            <th>{t("Common:Owner", { defaultValue: "Owner" })}</th>
            <th aria-label="actions" className={styles.tableActionsHead} />
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => {
            const options = getContextOptions(agent);
            return (
              <tr
                key={agent.id}
                className={styles.tableRow}
                onClick={() => goToAgent(agent.id)}
              >
                <td>
                  <div className={styles.tableTitleCell}>
                    <Avatar agent={agent} className={styles.tableAvatar} />
                    <span className={styles.tableTitle}>{agent.title}</span>
                  </div>
                </td>
                <td>{formatCreated(agent.created)}</td>
                <td>{agent.createdBy?.displayName ?? ""}</td>
                <td
                  className={styles.tableActionsCell}
                  onClick={stopPropagation}
                  onKeyDown={stopPropagation}
                  role="presentation"
                >
                  {options.length > 0 ? (
                    <ContextMenuButton
                      getData={() => options}
                      directionX="right"
                      isFill
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {loadMore}
    </>
  );
});

export default AgentsList;
