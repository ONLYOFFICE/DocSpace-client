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

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

export type TProjectsSortId = "AZ" | "DateAndTime";

export type TProjectsQuery = {
  search: string;
  withSkills: boolean;
  withKnowledge: boolean;
  sortId: TProjectsSortId;
  sortDirection: "asc" | "desc";
};

/** Newest first, nothing filtered: what the page opens with. */
export const DEFAULT_PROJECTS_QUERY: TProjectsQuery = {
  search: "",
  withSkills: false,
  withKnowledge: false,
  sortId: "DateAndTime",
  sortDirection: "desc",
};

/** Filter keys of the "Sources" group in the filter panel. */
export const SKILLS_FILTER_KEY = "with-skills";
export const KNOWLEDGE_FILTER_KEY = "with-knowledge";

/**
 * The projects the page lists for a query: the name search and the source
 * filters narrow the saved list, the sort orders what is left. Projects live
 * in the browser, so all of it happens here rather than on a server.
 */
export const queryProjects = (
  projects: TAiPreset[],
  query: TProjectsQuery,
): TAiPreset[] => {
  const needle = query.search.trim().toLocaleLowerCase();

  const filtered = projects.filter(
    (project) =>
      (!needle || project.name.toLocaleLowerCase().includes(needle)) &&
      (!query.withSkills || !!project.contextRoom) &&
      (!query.withKnowledge || !!project.knowledgeRoom),
  );

  const sign = query.sortDirection === "asc" ? 1 : -1;

  return [...filtered].sort((a, b) =>
    query.sortId === "AZ"
      ? sign * a.name.localeCompare(b.name)
      : sign * a.createdAt.localeCompare(b.createdAt),
  );
};

/** Whether the query hides any project, i.e. an empty result means "no match". */
export const isProjectsQueryFiltered = (query: TProjectsQuery): boolean =>
  !!query.search.trim() || query.withSkills || query.withKnowledge;
