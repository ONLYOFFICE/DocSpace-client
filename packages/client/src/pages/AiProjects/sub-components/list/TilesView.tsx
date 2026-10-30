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

import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { TileSkeleton } from "@docspace/shared/skeletons/tiles";
import type { TAiProject } from "@docspace/shared/api/ai/projects";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";

import { ProjectTile } from "./ProjectTile";
import styles from "../../AiProjects.module.scss";

type TilesViewProps = {
  store: AiProjectsStore;
  onOpen: (project: TAiProject) => void;
  getContextModel: (project: TAiProject) => ContextMenuModel[];
};

/** Skeleton tiles shown after the loaded ones while more pages remain. */
const LOADER_TILES = 4;

/**
 * The tiles view: room tiles in a responsive grid. Infinite scroll as in
 * Files: while the server holds more projects a row of tile skeletons closes
 * the grid, and the next page loads once it nears the viewport.
 */
export const TilesView = observer(({ store, onOpen, getContextModel }: TilesViewProps) => {
  const loaderRef = React.useRef<HTMLDivElement>(null);
  const hasMore = store.hasMoreProjects;

  React.useEffect(() => {
    const node = loaderRef.current;
    if (!hasMore || !node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void store.fetchMoreProjects();
      },
      { rootMargin: "0px 0px 400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, store, store.projects.length]);

  return (
    <div className={styles.tiles} data-testid="ai-projects-tiles">
      {store.projects.map((project) => (
        <ProjectTile
          key={project.id}
          store={store}
          project={project}
          onOpen={onOpen}
          getContextModel={() => getContextModel(project)}
        />
      ))}
      {hasMore
        ? Array.from({ length: LOADER_TILES }, (_, index) => (
            <div key={`tiles-loader_${index}`} ref={index === 0 ? loaderRef : undefined}>
              <TileSkeleton isRoom />
            </div>
          ))
        : null}
    </div>
  );
});

export default TilesView;
