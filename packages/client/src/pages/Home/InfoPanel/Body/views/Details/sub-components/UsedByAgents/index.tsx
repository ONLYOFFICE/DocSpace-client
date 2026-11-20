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
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getAiRoomProjects } from "@docspace/shared/api/ai/projects";
import type { TAiRoomProject } from "@docspace/shared/api/ai/projects";
import { RoomsType } from "@docspace/shared/enums";

import ProjectLogo from "SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo";

import commonStyles from "../../../../helpers/Common.module.scss";

import styles from "./UsedByAgents.module.scss";

type UsedByAgentsProps = {
  selection: unknown;
};

type TSourceRoom = {
  id: number;
  isRoom?: boolean;
  roomType?: RoomsType;
  linkedProjectsCount?: number;
};

/** The most agents listed; the rest are told by their number. */
const AGENTS_LIMIT = 100;

/**
 * The agents that use a skill set or a knowledge base selected in the list,
 * each by its logo and its name, sorted by name. Only the agents the user may
 * read are listed, so the list can be shorter than the room's "Used by"
 * number. It is read when the room is selected and again when that number
 * changes; a room no listed agent uses shows nothing.
 */
export const UsedByAgents = ({ selection }: UsedByAgentsProps) => {
  const { t } = useTranslation(["Common"]);
  const room = selection as TSourceRoom;
  const isSource =
    !!selection &&
    !Array.isArray(selection) &&
    !!room.isRoom &&
    (room.roomType === RoomsType.InstructionsRoom ||
      room.roomType === RoomsType.KnowledgeRoom);
  const id = isSource ? room.id : null;
  const linkedProjectsCount = isSource ? room.linkedProjectsCount : null;

  const [agents, setAgents] = React.useState<TAiRoomProject[]>([]);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    setAgents([]);
    setTotal(0);
    // A room known to be used by no agent is not asked for them.
    if (id === null || linkedProjectsCount === 0) return undefined;
    const controller = new AbortController();
    getAiRoomProjects(id, { count: AGENTS_LIMIT }, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setAgents(page.items);
        setTotal(page.total);
      })
      // A list that cannot be read is left out.
      .catch(() => undefined);
    return () => controller.abort();
  }, [id, linkedProjectsCount]);

  if (!isSource || agents.length === 0) return null;

  const rest = total - agents.length;

  return (
    <>
      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Common:UsedByAgents")}
        </Text>
      </div>
      <ul className={styles.list} data-testid="used-by-agents">
        {agents.map((agent) => (
          <li
            key={agent.id}
            className={styles.item}
            data-testid="used-by-agents-item"
          >
            <ProjectLogo project={agent} />
            <Text
              fontSize="13px"
              truncate
              className={styles.name}
              title={agent.title}
              dir="auto"
              data-testid="used-by-agents-name"
            >
              {agent.title}
            </Text>
          </li>
        ))}
        {rest > 0 ? (
          <li className={styles.more} data-testid="used-by-agents-more">
            <Text fontSize="13px" className={styles.moreText}>
              {`+${rest}`}
            </Text>
          </li>
        ) : null}
      </ul>
    </>
  );
};

export default UsedByAgents;
