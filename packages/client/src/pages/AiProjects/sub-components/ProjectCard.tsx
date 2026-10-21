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

import { useTranslation } from "react-i18next";

import classNames from "classnames";

import { Card } from "@onlyoffice/apps-ui-kit/components/card";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import SkillsIconUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import KnowledgeIconUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

import styles from "../AiProjects.module.scss";

type ProjectCardProps = {
  project: TAiPreset;
  onOpen: (project: TAiPreset) => void;
  isDisabled: boolean;
};

/**
 * One saved AI project: its name, the model it runs on and the rooms it
 * connects, and the button that opens it in a fresh fullscreen chat.
 */
export const ProjectCard = ({ project, onOpen, isDisabled }: ProjectCardProps) => {
  const { t } = useTranslation(["Common"]);
  const notSet = t("Common:AIProjectNotSet");

  // A connected room is a tinted pill in its source's colour, so a skills
  // room and a knowledge base read apart at a glance.
  const sourceRow = (
    label: string,
    room: TAiPreset["contextRoom"],
    kind: "skills" | "knowledge",
  ) => (
    <div className={styles.cardRow}>
      <Text className={styles.cardRowLabel}>{label}</Text>
      {room ? (
        <span
          className={classNames(styles.chip, {
            [styles.chipSkills]: kind === "skills",
            [styles.chipKnowledge]: kind === "knowledge",
          })}
          title={room.name}
        >
          <IconButton
            className={styles.chipIcon}
            iconName={kind === "skills" ? SkillsIconUrl : KnowledgeIconUrl}
            size={14}
            color="--ai-project-chip-icon"
          />
          <Text className={styles.chipLabel} truncate>
            {room.name}
          </Text>
        </span>
      ) : (
        <Text className={styles.cardRowEmpty}>{notSet}</Text>
      )}
    </div>
  );

  return (
    <Card
      className={styles.card}
      dataTestId="ai-project-card"
      title={
        <Text fontSize="15px" fontWeight={600} truncate title={project.name}>
          {project.name}
        </Text>
      }
      footer={
        <Button
          label={t("Common:AIProjectOpen")}
          size={ButtonSize.small}
          scale
          isDisabled={isDisabled}
          onClick={() => onOpen(project)}
          testId="ai-project-open"
        />
      }
    >
      <div className={styles.cardRows}>
        <div className={styles.cardRow}>
          <Text className={styles.cardRowLabel}>{t("Common:AIAgentModel")}</Text>
          <Text fontWeight={600} truncate>
            {project.profileName ?? notSet}
          </Text>
        </div>
        {sourceRow(t("Common:AIProjectSkills"), project.contextRoom, "skills")}
        {sourceRow(t("Common:Knowledge"), project.knowledgeRoom, "knowledge")}
      </div>
    </Card>
  );
};

export default ProjectCard;
