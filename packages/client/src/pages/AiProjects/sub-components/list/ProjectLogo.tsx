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

import classNames from "classnames";

import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import type { TLogo } from "@onlyoffice/apps-ui-kit/types";
import type { TAiProject, TAiProjectCover, TAiProjectLogo } from "@docspace/shared/api/ai/projects";

import styles from "../../AiProjects.module.scss";

/** The ui-kit logo object for a built-in cover: no uploaded sizes, the cover and its colour. */
export const coverLogo = (cover: TAiProjectCover, color: string): TLogo => ({
  cover,
  color,
  original: "",
  large: "",
  medium: "",
  small: "",
});

/** The ui-kit logo object for an uploaded picture, or `null` while the project has none. */
export const uploadedLogo = (logo: TAiProjectLogo): TLogo | null =>
  logo.medium
    ? {
        color: logo.color.replace("#", ""),
        original: logo.original ?? "",
        large: logo.large ?? "",
        medium: logo.medium,
        small: logo.small ?? "",
      }
    : null;

/** What `RoomIcon` draws for a project: the uploaded picture, else the cover in its colour, else nothing (the initials). */
export const projectLogo = (logo: TAiProjectLogo): TLogo | undefined =>
  uploadedLogo(logo) ?? (logo.cover ? coverLogo(logo.cover, logo.color.replace("#", "")) : undefined);

type ProjectLogoProps = {
  project: Pick<TAiProject, "title" | "logo">;
  size?: string;
  className?: string;
};

/** The logo a room shows: the uploaded picture, the built-in cover in the project's colour, or the initials. */
export const ProjectLogo = ({ project, size = "32px", className }: ProjectLogoProps) => (
  <RoomIcon
    title={project.title}
    color={project.logo.color.replace("#", "")}
    size={size}
    radius="6px"
    showDefault={!projectLogo(project.logo)}
    logo={projectLogo(project.logo)}
    className={classNames(styles.projectLogo, className)}
    dataTestId="ai-project-logo"
  />
);

export default ProjectLogo;
