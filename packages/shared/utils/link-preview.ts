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

import type { TTranslations } from "@docspace/ui-kit/providers/translation";

import { getBrandName } from "../constants/brands";

export const LINK_PREVIEW_IMAGE_ROUTE = "/login/link-preview";
export const LINK_PREVIEW_IMAGE_TYPE = "image/png";
export const LINK_PREVIEW_IMAGE_WIDTH = "1200";
export const LINK_PREVIEW_IMAGE_HEIGHT = "630";

export type TLinkPreview = {
  title: string;
  description?: string;
};

const createTranslator =
  (translations?: TTranslations, locale?: string) =>
  (key: string, values: Record<string, string>) => {
    const [namespace, name] = key.split(":");

    const template =
      translations?.get(locale || "en")?.get(namespace)?.[name] ??
      translations?.get("en")?.get(namespace)?.[name];

    if (!template) return undefined;

    return template.replace(/\{\{(\w+)\}\}/g, (match, placeholder) =>
      placeholder in values ? values[placeholder] : match,
    );
  };

export const getLinkPreview = (
  logoText?: string,
  translations?: TTranslations,
  locale?: string,
): TLinkPreview => {
  const organizationName = getBrandName("OrganizationName");
  const productName = getBrandName("ProductName");

  const title = logoText || organizationName;

  const t = createTranslator(translations, locale);

  const description = t("Common:LinkPreviewDescription", {
    organizationName: title,
    productName,
  });

  return { title, description };
};
