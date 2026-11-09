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
import type { TAiProject } from "@docspace/shared/api/ai/projects";
import PlusIcon from "PUBLIC_DIR/images/icons/16/button.plus.react.svg";

import { ProjectLogo } from "../list/ProjectLogo";
import styles from "./WorkspaceIntro.module.scss";

type WorkspaceIntroProps = {
  projects: TAiProject[];
  /** Opens the project's chat. */
  onOpen: (project: TAiProject) => void;
  /** Opens the project form; absent for a user who cannot create one. */
  onCreate?: () => void;
};

/**
 * What the empty AI Workspace chat shows above the composer: the agents (AI
 * projects) as cards, each opening its own chat, and a card that creates one.
 * The list is the section's menu, so the sidebar carries no entry for it.
 * Once the first message is sent the library drops the intro with the chips.
 */
export const WorkspaceIntro = ({ projects, onOpen, onCreate }: WorkspaceIntroProps) => {
  const { t } = useTranslation(["Common"]);

  if (projects.length === 0 && !onCreate) return null;

  return (
    <div className={styles.intro} data-testid="ai-workspace-intro">
      <Text fontSize="16px" fontWeight={700} lineHeight="22px" className={styles.title}>
        {t("Common:AiWorkspaceIntroTitle")}
      </Text>
      <div className={styles.grid} role="list">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            role="listitem"
            className={styles.card}
            title={project.title}
            onClick={() => onOpen(project)}
            data-testid="ai-workspace-agent"
          >
            <ProjectLogo project={project} size="40px" className={styles.logo} />
            <Text fontSize="13px" fontWeight={600} lineHeight="20px" className={styles.name} truncate>
              {project.title}
            </Text>
          </button>
        ))}
        {onCreate ? (
          <button
            type="button"
            role="listitem"
            className={`${styles.card} ${styles.create}`}
            onClick={onCreate}
            data-testid="ai-workspace-create-agent"
          >
            <span className={styles.plus} aria-hidden>
              <PlusIcon />
            </span>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px" className={styles.name} truncate>
              {t("Common:CreateAgent")}
            </Text>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default WorkspaceIntro;
