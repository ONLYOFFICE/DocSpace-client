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

import { FOLDER_CONTEXTS_LIMIT } from "@onlyoffice/ai-chat";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  useI18n as useAiChatI18n,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { useAiChatStoreOptional } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import {
  getAiProject,
  getAiProjectSkills,
  type TAiProjectSkillsRoom,
  type TAiProjectSource,
} from "@docspace/shared/api/ai/projects";

import { useStore } from "SRC_DIR/store/useStore";
import type { TAgentRoomsKind } from "SRC_DIR/store/AiProjectsStore";
import { getAgentRights } from "SRC_DIR/helpers/agentRights";
import RoomItem from "SRC_DIR/pages/AiProjects/sub-components/project/RoomItem";
import SkillIcon from "SRC_DIR/components/SkillIcon";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import FolderIcon from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg";
import RoomIcon from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg";

import styles from "./AiAgentContext.module.scss";

// The data sources of this portal, as the chat's store marks them.
const PORTAL_CLOUD = "docspace";

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
  const { instructionsRooms, knowledgeRooms } = project.aiProject;
  return {
    skillSets: instructionsRooms.filter((room) => room.available),
    knowledgeBases: knowledgeRooms.filter((room) => room.available),
    skills: Object.fromEntries(rooms.map((room) => [room.id, room.skills])),
    // Editing is for the agent's members: a DocSpace admin outside it reads
    // the agent with full rights and is still offered no "Manage ..." rows.
    canEdit: getAgentRights(project).edit,
  };
};

type SectionProps = {
  testId: string;
  label: string;
  /** What the assistant does with the section's sources. */
  hint: string;
  children?: React.ReactNode;
};

/** A section of the tab: its caption, the line under it, its rows. */
const Section = ({ testId, label, hint, children }: SectionProps) => (
  <section className={styles.section} data-testid={testId}>
    <Text as="h4" fontSize="12px" fontWeight={600} className={styles.heading}>
      {label}
    </Text>
    <Text
      fontSize="12px"
      className={styles.hint}
      data-testid={`${testId}-hint`}
    >
      {hint}
    </Text>
    {children}
  </section>
);

type ManageRowProps = {
  testId: string;
  label: string;
  onClick: () => void;
};

/** The "Manage ..." row a section ends with. */
const ManageRow = ({ testId, label, onClick }: ManageRowProps) => (
  <Link
    className={styles.manage}
    type={LinkType.action}
    color="accent"
    isHovered
    fontSize="13px"
    fontWeight={600}
    onClick={onClick}
    dataTestId={testId}
  >
    {label}
  </Link>
);

/**
 * Data sources: the folders and rooms the user connected to the chat that
 * runs on the agent. They are the user's own, not the agent's: every member
 * removes one from its row and connects one more with "Manage sources...",
 * as in the composer's menus, until the limit. Rendered only while the chat
 * runs on the agent, which is when the chat's stores hold its sources.
 */
const DataSources = () => {
  const { t } = useTranslation(["Common"]);
  const { t: chatT } = useAiChatI18n();
  const { useCloudsStore } = useAiChatStores();
  const folders = useCloudsStore((s) => s.selectedFolderContexts);
  const disconnect = useCloudsStore((s) => s.deselectFolderContext);
  const addDataSource = useAiChatStoreOptional()?.addDataSource;

  const rows = folders.filter((item) => item.cloud === PORTAL_CLOUD);

  return (
    <Section
      testId="ai-agent-context-data-sources"
      label={chatT("DataSources")}
      hint={chatT("DataSourcesHint")}
    >
      {rows.map(({ cloud, room }) => (
        <div
          className={styles.dataSource}
          key={room.id}
          data-testid="ai-agent-context-data-source"
        >
          <span className={styles.dataSourceIcon} aria-hidden>
            {/* A source picked before the kind was recorded is a folder. */}
            {room.kind === "room" ? <RoomIcon /> : <FolderIcon />}
          </span>
          <Text
            fontSize="13px"
            fontWeight={600}
            lineHeight="15px"
            title={room.name}
            truncate
            noSelect
          >
            {room.name}
          </Text>
          <IconButton
            className={styles.dataSourceRemove}
            iconName={CrossReactSvgUrl}
            size={12}
            title={t("Common:RemoveSource", { name: room.name })}
            ariaLabel={t("Common:RemoveSource", { name: room.name })}
            onClick={() => disconnect(cloud, room.id)}
            dataTestId="ai-agent-context-remove-data-source"
          />
        </div>
      ))}
      {addDataSource && rows.length < FOLDER_CONTEXTS_LIMIT ? (
        <ManageRow
          testId="ai-agent-context-manage-data-sources"
          label={t("Common:ManageSources")}
          onClick={addDataSource}
        />
      ) : null}
    </Section>
  );
};

type AiAgentContextProps = {
  /** The agent's room id. */
  id: number;
};

/**
 * The Context tab of an agent's Info panel: the skill sets the agent is
 * linked to, each unfolded to its skills until folded by hand, each skill
 * with the skill's icon, and its knowledge bases. Each
 * section is headed as the same list is in the composer's slash menu: a
 * caption and a line saying what the assistant does with it, which is all
 * an empty section shows. A name opens its room. While the chat runs on the
 * agent, the user's own data sources of that chat come last. Those who may edit the agent get a "Manage ..." row under
 * each section ("Manage skill sets...", "Manage knowledge bases..."), which
 * opens the selector of that section's rooms; the pick is saved at once.
 */
const AiAgentContext = ({ id }: AiAgentContextProps) => {
  const { t } = useTranslation(["Common"]);
  // The captions' lines are the chat library's own, the ones its slash menu
  // shows over the same lists: read from its translations, not copied here.
  const { t: chatT } = useAiChatI18n();
  const aiProjectsStore = useStore("aiProjectsStore");
  // The chat runs on this agent: on its page, or picked in the chat panel.
  const isChatAgent =
    useStore("aiPresetsStore").activePreset?.id === String(id);

  const [context, setContext] = React.useState<TContext | null>(null);
  const [failed, setFailed] = React.useState(false);
  // Every skill set starts unfolded; only the ones folded by hand are kept.
  const [collapsed, setCollapsed] = React.useState<Record<number, boolean>>({});

  // Read again once the agent is saved (the pick of a "Manage ..." row) or
  // changed elsewhere.
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
      setCollapsed({});
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

  // The section's own "Manage ..." row, for those who may edit the agent:
  // it opens the selector of that kind of rooms, as the agent's form and
  // its chat's composer do.
  const manageRow = (testId: string, label: string, kind: TAgentRoomsKind) =>
    context.canEdit ? (
      <ManageRow
        testId={testId}
        label={label}
        onClick={() => void aiProjectsStore.openRoomsSelector(id, kind)}
      />
    ) : null;

  const section = (
    testId: string,
    label: string,
    hint: string,
    rooms: TAiProjectSource[],
    row: (room: TAiProjectSource) => React.ReactNode,
    manage: React.ReactNode,
  ) => (
    <Section testId={testId} label={label} hint={hint}>
      {rooms.map(row)}
      {manage}
    </Section>
  );

  return (
    <div className={styles.context} data-testid="ai-agent-context">
      {section(
        "ai-agent-context-skills",
        t("Common:SkillSets"),
        chatT("SkillSetsHint"),
        context.skillSets,
        (room) => {
          const skills = context.skills[room.id] ?? [];
          const isExpanded = skills.length > 0 && !collapsed[room.id];
          return (
            <React.Fragment key={room.id}>
              <RoomItem
                id={room.id}
                title={room.title}
                icon="instructionsRoom.svg"
                isExpanded={isExpanded}
                onToggle={
                  skills.length > 0
                    ? () =>
                        setCollapsed((state) => ({
                          ...state,
                          [room.id]: !state[room.id],
                        }))
                    : undefined
                }
              />
              {isExpanded ? (
                <ul className={styles.skills}>
                  {skills.map((skill) => (
                    <li key={skill.id} className={styles.skillRow}>
                      <SkillIcon kind="skill" size={24} />
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
        manageRow(
          "ai-agent-context-manage-skills",
          t("Common:ManageSkillSets"),
          "instructions",
        ),
      )}
      {section(
        "ai-agent-context-knowledge",
        t("Common:AIProjectKnowledgeRooms"),
        chatT("KnowledgeBasesHint"),
        context.knowledgeBases,
        (room) => (
          <RoomItem
            key={room.id}
            id={room.id}
            title={room.title}
            icon="knowledgeRoom.svg"
          />
        ),
        manageRow(
          "ai-agent-context-manage-knowledge",
          t("Common:ManageKnowledgeBases"),
          "knowledge",
        ),
      )}
      {isChatAgent ? <DataSources /> : null}
    </div>
  );
};

export default observer(AiAgentContext);
