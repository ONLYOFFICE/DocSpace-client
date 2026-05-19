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

"use client";

import {
  FormsSection,
  SettingsSubSection,
  DEFAULT_SETTINGS_SUBSECTION,
} from "@/types/forms";

const FORMS_PREFIX = "/forms/";

const SECTION_MAP: Record<string, FormsSection> = {
  [FormsSection.MyForms]: FormsSection.MyForms,
  [FormsSection.Library]: FormsSection.Library,
  [FormsSection.InProgress]: FormsSection.InProgress,
  [FormsSection.CompletedForms]: FormsSection.CompletedForms,
  [FormsSection.Settings]: FormsSection.Settings,
};

export function sectionFromPathname(pathname: string): FormsSection {
  const formsIndex = pathname.indexOf(FORMS_PREFIX);

  if (formsIndex === -1) return FormsSection.MyForms;

  const segment = pathname.slice(formsIndex + FORMS_PREFIX.length).split("/")[0];

  return SECTION_MAP[segment] ?? FormsSection.MyForms;
}

export function sectionToPath(section: FormsSection): string {
  return `${FORMS_PREFIX.slice(0, -1)}/${section}`;
}

const SETTINGS_PREFIX = "/forms/settings/";

const SETTINGS_SUB_MAP: Record<string, SettingsSubSection> = {
  [SettingsSubSection.Billing]: SettingsSubSection.Billing,
  [SettingsSubSection.AiAgent]: SettingsSubSection.AiAgent,
  [SettingsSubSection.Access]: SettingsSubSection.Access,
  [SettingsSubSection.CollectData]: SettingsSubSection.CollectData,
};

export function settingsSubSectionFromPathname(
  pathname: string,
): SettingsSubSection {
  const idx = pathname.indexOf(SETTINGS_PREFIX);
  if (idx === -1) return DEFAULT_SETTINGS_SUBSECTION;

  const sub = pathname.slice(idx + SETTINGS_PREFIX.length).split("/")[0];
  return SETTINGS_SUB_MAP[sub] ?? DEFAULT_SETTINGS_SUBSECTION;
}

export function settingsSubSectionToPath(sub: SettingsSubSection): string {
  return `/forms/settings/${sub}`;
}
