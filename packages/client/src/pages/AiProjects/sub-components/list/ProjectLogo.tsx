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

import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import type { TLogo } from "@onlyoffice/apps-ui-kit/types";
import type { TAiProject, TAiProjectCover } from "@docspace/shared/api/ai/projects";

/** The ui-kit logo object for a built-in cover: no uploaded sizes, the cover and its colour. */
export const coverLogo = (cover: TAiProjectCover, color: string): TLogo => ({
  cover,
  color,
  original: "",
  large: "",
  medium: "",
  small: "",
});

type ProjectLogoProps = {
  project: Pick<TAiProject, "title" | "logo">;
  size?: string;
  className?: string;
};

/** The logo a room shows: the built-in cover in the project's colour, or the initials. */
export const ProjectLogo = ({ project, size = "32px", className }: ProjectLogoProps) => (
  <RoomIcon
    title={project.title}
    color={project.logo.color.replace("#", "")}
    size={size}
    radius="6px"
    showDefault={!project.logo.cover}
    logo={project.logo.cover ? coverLogo(project.logo.cover, project.logo.color.replace("#", "")) : undefined}
    className={className}
    dataTestId="ai-project-logo"
  />
);

export default ProjectLogo;
