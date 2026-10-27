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

import {
  ContextMenu,
  type ContextMenuModel,
  type ContextMenuRefType,
} from "@onlyoffice/apps-ui-kit/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { TAiProject } from "@docspace/shared/api/ai/projects";

import { ProjectLogo } from "./ProjectLogo";
import { SourceTags } from "./SourceTags";
import styles from "../../AiProjects.module.scss";

type ProjectTileProps = {
  project: TAiProject;
  onOpen: (project: TAiProject) => void;
  getContextModel: () => ContextMenuModel[];
};

/**
 * A project card of the tiles view, as the mockups draw it: the logo, the
 * name and the "..." in the top row, then one row per kind of source with
 * its rooms as tags (the rest folded into "+N").
 */
export const ProjectTile = ({ project, onOpen, getContextModel }: ProjectTileProps) => {
  const { t } = useTranslation(["Common"]);
  const menuRef = React.useRef<ContextMenuRefType>(null);
  const { instructionsRooms, knowledgeRooms } = project.aiProject;

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    menuRef.current?.show(e);
  };

  // The menu and the "..." overflow tag open their own dropdowns, rendered
  // through portals, and React bubbles those clicks up the component tree:
  // each sits in a wrapper that stops them before they reach the card and
  // open the project.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className={styles.projectTile}
      onClick={() => onOpen(project)}
      onContextMenu={onContextMenu}
      data-testid={`ai-project-tile-${project.id}`}
    >
      <div className={styles.projectTileTop}>
        <ProjectLogo project={project} />
        <Text className={styles.projectTileName} fontWeight={600} fontSize="13px" truncate title={project.title}>
          {project.title}
        </Text>
        <div className={styles.projectTileMenu} onClick={stop} onContextMenu={stop} onDoubleClick={stop}>
          <ContextMenuButton
            className="expandButton"
            title={t("Common:TitleShowActions")}
            getData={getContextModel}
            onClick={onContextMenu}
            directionX="right"
            displayType={ContextMenuButtonDisplayType.toggle}
          />
          <ContextMenu ref={menuRef} model={[]} getContextModel={getContextModel} withBackdrop />
        </div>
      </div>
      {instructionsRooms.length > 0 ? (
        <div className={styles.projectTileRow}>
          <Text className={styles.projectTileLabel} fontSize="11px" truncate>
            {t("Common:AIProjectInstructions")}
          </Text>
          <div className={styles.projectTileTags} onClick={stop} onContextMenu={stop} onDoubleClick={stop}>
            <SourceTags rooms={instructionsRooms} columnCount={2} />
          </div>
        </div>
      ) : null}
      {knowledgeRooms.length > 0 ? (
        <div className={styles.projectTileRow}>
          <Text className={styles.projectTileLabel} fontSize="11px" truncate>
            {t("Common:Knowledge")}
          </Text>
          <div className={styles.projectTileTags} onClick={stop} onContextMenu={stop} onDoubleClick={stop}>
            <SourceTags rooms={knowledgeRooms} columnCount={2} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectTile;
