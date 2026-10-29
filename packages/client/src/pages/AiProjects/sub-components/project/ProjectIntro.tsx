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
import classNames from "classnames";
import { observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import type { TAiProject, TAiProjectSource } from "@docspace/shared/api/ai/projects";
import { useStore } from "SRC_DIR/store/useStore";

import { ProjectLogo } from "../list/ProjectLogo";
import RoomItem from "./RoomItem";
import { isManager } from "../../utils";
import styles from "./ProjectIntro.module.scss";

/** Rooms of a kind shown before the rest fold into a "+N" chip. */
const VISIBLE_ROOMS = 3;

type SourceGroupProps = {
  label: string;
  rooms: TAiProjectSource[];
  kind: "instructions" | "knowledge";
};

/**
 * One kind of linked rooms as a row of chips: each opens its room. A long
 * list shows its first rooms and a "+N" chip that unfolds the rest.
 */
const SourceGroup = ({ label, rooms, kind }: SourceGroupProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? rooms : rooms.slice(0, VISIBLE_ROOMS);
  const hidden = rooms.length - shown.length;

  return (
    <div className={styles.group} data-testid={`ai-project-intro-${kind}`}>
      <Text fontSize="12px" lineHeight="16px" className={styles.groupLabel}>
        {label}
      </Text>
      <div className={styles.chips}>
        {shown.map((room) => (
          <div key={room.id} className={styles.chip}>
            <RoomItem
              id={room.id}
              title={room.title}
              logo={room.logo}
              icon={kind === "instructions" ? "instructionsRoom.svg" : "knowledgeRoom.svg"}
            />
          </div>
        ))}
        {hidden > 0 ? (
          <button
            type="button"
            className={classNames(styles.chip, styles.more)}
            onClick={() => setExpanded(true)}
            data-testid={`ai-project-intro-${kind}-more`}
          >
            {`+${hidden}`}
          </button>
        ) : null}
      </div>
    </div>
  );
};

type ProjectIntroProps = {
  project: TAiProject;
};

/**
 * What an empty project chat shows above the composer: the project logo and
 * name, the model it chats with, and the rooms it draws on as chips, one row
 * for the Instructions rooms and one for the Knowledge bases.
 */
export const ProjectIntro = observer(({ project }: ProjectIntroProps) => {
  const { t } = useTranslation(["Common"]);
  const { useProfilesStore } = useStores();
  const aiProjectsStore = useStore("aiProjectsStore");
  // The stored model is gone or cannot chat: no round can run until it is
  // changed, so the intro says so instead of the model line. Owner and
  // managers get the Edit project action, members are told to ask one.
  const modelUnavailable = project.aiProject.profile?.available === false;
  const canEdit = isManager(project);
  // The model the composer shows: the one picked for this chat, else the
  // chat default, else the portal default (ai-chat's current chat profile).
  const currentModel = useProfilesStore((s) => (s.sessionChatProfile ?? s.chatProfile ?? s.defaultProfile)?.name);
  // A room the caller can no longer read is not offered.
  const instructionsRooms = project.aiProject.instructionsRooms.filter((room) => room.available);
  const knowledgeRooms = project.aiProject.knowledgeRooms.filter((room) => room.available);

  const model = currentModel ?? project.aiProject.profile?.name ?? "";

  return (
    <div className={styles.intro} data-testid="ai-project-intro">
      <ProjectLogo project={project} size="48px" className={styles.logo} />
      <Text fontSize="16px" fontWeight={700} lineHeight="22px" className={styles.title} truncate>
        {project.title}
      </Text>
      {modelUnavailable ? (
        <div className={styles.modelError} role="alert" data-testid="ai-project-model-unavailable">
          <Text fontSize="13px" fontWeight={600} lineHeight="20px">
            {t("Common:AIProjectModelUnavailableTitle")}
          </Text>
          <Text fontSize="13px" lineHeight="20px" className={styles.description}>
            {canEdit ? t("Common:AIProjectModelUnavailableManager") : t("Common:AIProjectModelUnavailableMember")}
          </Text>
          {canEdit ? (
            <Button
              size={ButtonSize.small}
              primary
              label={t("Common:AIProjectEdit")}
              onClick={() => aiProjectsStore.openEditDialog(project)}
              testId="ai-project-model-unavailable-edit"
            />
          ) : null}
        </div>
      ) : (
        <Text fontSize="13px" lineHeight="20px" className={styles.description}>
          <Trans
            t={t}
            i18nKey="Common:AIProjectIntroModel"
            values={{ model }}
            components={{ 1: <strong className={styles.model} /> }}
          />
        </Text>
      )}
      {instructionsRooms.length > 0 || knowledgeRooms.length > 0 ? (
        <div className={styles.sources}>
          {instructionsRooms.length > 0 ? (
            <SourceGroup label={t("Common:AIProjectInstructions")} rooms={instructionsRooms} kind="instructions" />
          ) : null}
          {knowledgeRooms.length > 0 ? (
            <SourceGroup label={t("Common:Knowledge")} rooms={knowledgeRooms} kind="knowledge" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export default ProjectIntro;
