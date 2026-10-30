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

import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { RoomTile } from "@onlyoffice/apps-ui-kit/components/tiles/room-tile";
import { TileContent } from "@onlyoffice/apps-ui-kit/components/tiles/tile-content";
import type { TAiProject } from "@docspace/shared/api/ai/projects";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { ProjectLogo } from "./ProjectLogo";
import { ProjectTags } from "./ProjectTags";

type ProjectTileProps = {
  store: AiProjectsStore;
  project: TAiProject;
  onOpen: (project: TAiProject) => void;
  getContextModel: () => ContextMenuModel[];
};

/** How many tags a card shows before the rest fold into the "+N" tag. */
const TAG_COLUMNS = 3;

const noop = () => {};

/**
 * A project card: the room tile of the rooms list (FileTile.js), with the
 * project logo, the name and its tags, which the room type stands in for
 * while the project has none.
 */
export const ProjectTile = observer(({ store, project, onOpen, getContextModel }: ProjectTileProps) => {
  const { t } = useTranslation(["Common"]);
  const { theme } = useStore("settingsStore");
  const contextOptions = getContextModel();
  const item = {
    id: project.id,
    title: project.title,
    roomType: String(project.roomType),
    tags: project.tags,
    contextOptions,
    logo: { color: project.logo.color.replace("#", "") },
  };

  return (
    <RoomTile
      item={item}
      element={<ProjectLogo project={project} />}
      contextOptions={contextOptions}
      getContextModel={getContextModel}
      columnCount={TAG_COLUMNS}
      thumbnailClick={() => onOpen(project)}
      selectTag={store.selectTag}
      selectOption={noop}
      getRoomTypeName={() => t("Common:AIProjectRoomTitle")}
      customBottomContent={(isHovered) => (
        <ProjectTags store={store} project={project} columnCount={TAG_COLUMNS} isActive={isHovered} />
      )}
      dataTestId={`ai-project-tile-${project.id}`}
    >
      <TileContent>
        <Link
          className="item-file-name"
          containerWidth="100%"
          type={LinkType.page}
          title={project.title}
          fontWeight={600}
          color={theme.filesSection.tilesView.color}
          isTextOverflow
          dir="auto"
          view="tile"
          onClick={() => onOpen(project)}
        >
          {project.title}
        </Link>
      </TileContent>
    </RoomTile>
  );
});

export default ProjectTile;
