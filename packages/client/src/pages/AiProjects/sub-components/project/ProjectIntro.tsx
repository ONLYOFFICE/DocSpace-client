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
import { useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import type { TAiProject, TAiProjectSource } from "@docspace/shared/api/ai/projects";

import { ProjectLogo } from "../list/ProjectLogo";
import { sourceNames } from "../list/SourceTags";
import styles from "./ProjectIntro.module.scss";

type RoomLinksProps = {
  rooms: TAiProjectSource[];
  className: string;
  /** Filled by `Trans` with the joined names; the links replace them. */
  children?: React.ReactNode;
};

/** The rooms named in the intro, each a link that opens the room. */
const RoomLinks = ({ rooms, className }: RoomLinksProps) => {
  const navigate = useNavigate();
  return (
    <>
      {rooms.map((room, index) => (
        <React.Fragment key={room.id}>
          {index > 0 ? ", " : null}
          <button
            type="button"
            className={className}
            onClick={() => navigate(`/rooms/shared/${room.id}`)}
            data-testid={`ai-project-intro-room-${room.id}`}
          >
            {room.title}
          </button>
        </React.Fragment>
      ))}
    </>
  );
};

type ProjectIntroProps = {
  project: TAiProject;
};

/**
 * What an empty project chat shows above the suggestion chips, as the
 * mockup draws it: the project logo and name, and one line naming the
 * model, the Instructions rooms and the Knowledge bases it chats with.
 */
export const ProjectIntro = observer(({ project }: ProjectIntroProps) => {
  const { t } = useTranslation(["Common"]);
  const { useProfilesStore } = useStores();
  // The model the composer shows: the one picked for this chat, else the
  // chat default, else the portal default (ai-chat's current chat profile).
  const currentModel = useProfilesStore((s) => (s.sessionChatProfile ?? s.chatProfile ?? s.defaultProfile)?.name);
  const { instructionsRooms, knowledgeRooms } = project.aiProject;

  const model = currentModel ?? project.aiProject.profile?.name ?? "";
  const instructions = sourceNames(instructionsRooms);
  const knowledge = sourceNames(knowledgeRooms);
  const components = {
    1: <strong className={styles.model} />,
    2: <RoomLinks rooms={instructionsRooms} className={classNames(styles.room, styles.skills)} />,
    3: <RoomLinks rooms={knowledgeRooms} className={classNames(styles.room, styles.knowledge)} />,
  };
  const values = { model, instructions, knowledge };
  // Literal keys, one per combination of sources, so the locale checks see them.
  const line =
    instructionsRooms.length > 0 && knowledgeRooms.length > 0 ? (
      <Trans t={t} i18nKey="Common:AIProjectIntroBoth" values={values} components={components} />
    ) : instructionsRooms.length > 0 ? (
      <Trans t={t} i18nKey="Common:AIProjectIntroInstructions" values={values} components={components} />
    ) : knowledgeRooms.length > 0 ? (
      <Trans t={t} i18nKey="Common:AIProjectIntroKnowledge" values={values} components={components} />
    ) : (
      <Trans t={t} i18nKey="Common:AIProjectIntroModel" values={values} components={components} />
    );

  return (
    <div className={styles.intro} data-testid="ai-project-intro">
      <ProjectLogo project={project} size="48px" className={styles.logo} />
      <Text fontSize="16px" fontWeight={700} lineHeight="22px" className={styles.title} truncate>
        {project.title}
      </Text>
      <Text fontSize="13px" lineHeight="20px" className={styles.description}>
        {line}
      </Text>
    </div>
  );
});

export default ProjectIntro;
