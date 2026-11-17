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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  getAiProject,
  getAiProjectSkills,
  type TAiProjectSkillsRoom,
  type TAiProjectSource,
} from "@docspace/shared/api/ai/projects";

import { useStore } from "SRC_DIR/store/useStore";
import RoomItem from "SRC_DIR/pages/AiProjects/sub-components/project/RoomItem";

import styles from "./AiAgentContext.module.scss";

type TContext = {
  skillSets: TAiProjectSource[];
  knowledgeBases: TAiProjectSource[];
  /** The skills of each skill set, by the set's room id. */
  skills: Record<number, TAiProjectSkillsRoom["skills"]>;
  canEdit: boolean;
};

/** What the agent draws on: the rooms the caller can still read, and their skills. */
export const readAgentContext = async (id: number): Promise<TContext> => {
  const [project, rooms] = await Promise.all([
    getAiProject(id),
    // The skills are a detail of the list: without them the sets are still shown.
    getAiProjectSkills(id).catch(() => [] as TAiProjectSkillsRoom[]),
  ]);
  const { instructionsRooms, knowledgeRooms, canEditSettings } =
    project.aiProject;
  return {
    skillSets: instructionsRooms.filter((room) => room.available),
    knowledgeBases: knowledgeRooms.filter((room) => room.available),
    skills: Object.fromEntries(rooms.map((room) => [room.id, room.skills])),
    canEdit: canEditSettings,
  };
};

type AiAgentContextProps = {
  /** The agent's room id. */
  id: number;
};

/**
 * The Context tab of an agent's Info panel: the skill sets the agent is
 * linked to, each unfolding to its skills, and its knowledge bases. A name
 * opens its room. Those who may edit the agent get a "Manage ..." row under
 * each section ("Manage skill sets...", "Manage knowledge bases..."), which
 * opens the agent's form.
 */
const AiAgentContext = ({ id }: AiAgentContextProps) => {
  const { t } = useTranslation(["Common"]);
  const aiProjectsStore = useStore("aiProjectsStore");

  const [context, setContext] = React.useState<TContext | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});

  // Read again once the agent is saved (a "Manage ..." row) or changed elsewhere.
  const revision = aiProjectsStore.projectRevisions[id] ?? 0;
  const shownId = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    // Another agent starts afresh; the same one keeps what it shows until
    // it is read again.
    if (shownId.current !== id) {
      shownId.current = id;
      setContext(null);
      setFailed(false);
      setExpanded({});
    }
    readAgentContext(id)
      .then((data) => {
        if (cancelled) return;
        setContext(data);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [id, revision]);

  if (failed)
    return (
      <Text className={styles.empty} data-testid="ai-agent-context-error">
        {t("Common:SomethingWentWrong")}
      </Text>
    );

  if (!context) return null;

  // The section's own "Manage ..." row, for those who may edit the agent.
  const manageRow = (testId: string, label: string) =>
    context.canEdit ? (
      <Link
        className={styles.manage}
        type={LinkType.action}
        isHovered
        fontSize="13px"
        fontWeight={600}
        onClick={() => aiProjectsStore.openEditDialogById(id)}
        dataTestId={testId}
      >
        {label}
      </Link>
    ) : null;

  const section = (
    testId: string,
    label: string,
    rooms: TAiProjectSource[],
    row: (room: TAiProjectSource) => React.ReactNode,
    manage: React.ReactNode,
  ) => (
    <section className={styles.section} data-testid={testId}>
      <Text
        as="h4"
        fontSize="12px"
        fontWeight={600}
        className={styles.heading}
      >
        {label}
      </Text>
      {rooms.length > 0 ? (
        rooms.map(row)
      ) : (
        <Text fontSize="13px" className={styles.empty}>
          {"—"}
        </Text>
      )}
      {manage}
    </section>
  );

  return (
    <div className={styles.context} data-testid="ai-agent-context">
      {section(
        "ai-agent-context-skills",
        t("Common:SkillSets"),
        context.skillSets,
        (room) => {
          const skills = context.skills[room.id] ?? [];
          const isExpanded = !!expanded[room.id];
          return (
            <React.Fragment key={room.id}>
              <RoomItem
                id={room.id}
                title={room.title}
                logo={room.logo}
                icon="instructionsRoom.svg"
                isExpanded={isExpanded}
                onToggle={
                  skills.length > 0
                    ? () =>
                        setExpanded((state) => ({
                          ...state,
                          [room.id]: !state[room.id],
                        }))
                    : undefined
                }
              />
              {isExpanded ? (
                <ul className={styles.skills}>
                  {skills.map((skill) => (
                    <li key={skill.id}>
                      <Text
                        fontSize="13px"
                        className={styles.skill}
                        title={skill.description}
                      >
                        {skill.name}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : null}
            </React.Fragment>
          );
        },
        manageRow("ai-agent-context-manage-skills", t("Common:ManageSkillSets")),
      )}
      {section(
        "ai-agent-context-knowledge",
        t("Common:AIProjectKnowledgeRooms"),
        context.knowledgeBases,
        (room) => (
          <RoomItem
            key={room.id}
            id={room.id}
            title={room.title}
            logo={room.logo}
            icon="knowledgeRoom.svg"
          />
        ),
        manageRow(
          "ai-agent-context-manage-knowledge",
          t("Common:ManageKnowledgeBases"),
        ),
      )}
    </div>
  );
};

export default observer(AiAgentContext);
