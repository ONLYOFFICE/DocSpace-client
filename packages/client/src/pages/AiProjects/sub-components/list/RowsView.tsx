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

import { observer } from "mobx-react";
import classNames from "classnames";

import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import {
  FilesRow,
  FilesRowContainer,
  FilesRowContent,
  FilesRowWrapper,
} from "@docspace/shared/components/files-row";
import type { TAiProject } from "@docspace/shared/api/ai/projects";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";

import { ProjectLogo } from "./ProjectLogo";
import styles from "../../AiProjects.module.scss";

type RowsViewProps = {
  store: AiProjectsStore;
  onOpen: (project: TAiProject) => void;
  getContextModel: (project: TAiProject) => ContextMenuModel[];
  locale?: string;
};

/**
 * One row per project, built like a room's row in Files (SimpleFilesRow):
 * the project logo as the row's icon, the title, and under it one grey line
 * that follows the sort, as a room's does: its tags, its owner or its last
 * activity. RowContent reads its children by position - title, icons, then
 * side elements whose text it joins into that line - so the empty second
 * child keeps that line out of the title line.
 */
export const RowsView = observer(({ store, onOpen, getContextModel, locale }: RowsViewProps) => {
  // The side line's colour Files rows use (FilesRowContent.js).
  const { theme } = useStore("settingsStore");

  // What the side line says, by the sort (FilesRowContent.js).
  const sideInfo = (project: TAiProject) => {
    switch (store.sortBy) {
      case "Tags":
        return project.tags.join(", ");
      case "Author":
        return project.createdBy?.displayName ?? "";
      default:
        return getCorrectDate(locale ?? "en", project.updated);
    }
  };

  return (
    <FilesRowContainer
      className={classNames("files-row-container", styles.rows)}
      // Infinite scroll as in Files: the total sizes the list, the next page
      // loads as its end comes into view.
      useReactWindow
      filesLength={store.projects.length}
      hasMoreFiles={store.hasMoreProjects}
      itemCount={store.total}
      itemHeight={58}
      fetchMoreFiles={store.fetchMoreProjects}
    >
      {store.projects.map((project, index) => {
        const info = sideInfo(project);
        return (
          <FilesRowWrapper key={project.id} className="row-wrapper" isFirstElem={index === 0}>
            <FilesRow
              className="files-row"
              element={<ProjectLogo project={project} />}
              // "modern" draws the icon only together with a selection
              // checkbox, which projects do not have.
              mode="default"
              contextOptions={getContextModel(project)}
              getContextModel={() => getContextModel(project)}
              onRowClick={() => onOpen(project)}
              isRoom
              withoutBorder
              dataTestId={`ai-project-row-${project.id}`}
            >
              <FilesRowContent sectionWidth={1} sideColor={theme.filesSection.rowView.sideColor}>
                <Link
                  className="row-content-link"
                  containerWidth="55%"
                  type={LinkType.page}
                  fontWeight={600}
                  fontSize="15px"
                  title={project.title}
                  isTextOverflow
                  truncate
                  dir="auto"
                >
                  {project.title}
                </Link>
                <div className="badges" />
                {info ? (
                  <Text fontSize="12px" fontWeight={400} className="row_update-text">
                    {info}
                  </Text>
                ) : (
                  <span />
                )}
              </FilesRowContent>
            </FilesRow>
          </FilesRowWrapper>
        );
      })}
    </FilesRowContainer>
  );
});

export default RowsView;
