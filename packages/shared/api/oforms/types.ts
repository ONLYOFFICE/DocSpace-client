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

import type OformsFilter from "./filter";

/**
 * Types of the ONLYOFFICE form gallery (oforms) Strapi API responses.
 *
 * The API client in `./index.js` is still untyped (`@ts-nocheck`);
 * these shapes are derived from the fields actually consumed by the
 * client (OformsStore and the TemplateGallery components).
 */

/** One image format entry of a Strapi media field (`formats.thumbnail`). */
export type TOformImageFormat = {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
};

/** A form template entity returned by the forms list endpoint. */
export type TOformFile = {
  id: number;
  attributes: {
    name_form: string;
    updatedAt: string;
    description_card: string;
    template_desc: string;
    card_prewiew: {
      data: {
        id: number;
        attributes: {
          url: string;
        };
      };
    };
    template_image: {
      data: {
        id: number;
        attributes: {
          formats: {
            thumbnail: TOformImageFormat;
          };
        };
      };
    };
    file_oform: {
      data: {
        id: number;
        attributes: {
          size: number;
        };
      }[];
    };
  };
};

/** Strapi pagination block of a list response (`meta.pagination`). */
export type TOformsPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

/** Body of the forms list response (`response.data`). */
export type TOformsListResponse = {
  data: TOformFile[];
  meta: {
    pagination: TOformsPagination;
  };
};

/** A localized variant of a category (`attributes.localizations.data[n]`). */
export type TOformCategoryLocalization = {
  id?: number;
  attributes: {
    /**
     * The localized category title lives under a dynamic key named after
     * the category type (e.g. `categorie`, `types`, `compilations`).
     */
    [key: string]: unknown;
    locale?: string;
  };
};

/**
 * A category entity. Besides `localizations`, the category title is stored
 * under a dynamic attribute key named after its category type.
 */
export type TOformCategory = {
  id: number | string;
  attributes: {
    [key: string]: unknown;
    localizations?: {
      data: TOformCategoryLocalization[] | null;
    } | null;
  };
};

/** A category type (menu) entity of the `/menu-translations` endpoint. */
export type TOformCategoryType = {
  id: number | string;
  attributes: {
    [key: string]: unknown;
    categoryTitle: string;
    categoryId: string;
  };
};

/** One locale entry of the `/i18n/locales` endpoint. */
export type TOformLocale = {
  code: string;
};

/**
 * Instance shape of `OformsFilter` as the client actually uses it:
 * `locale` starts as `null` but is reassigned to a string, and `icon`
 * is an ad-hoc property attached by `OformsStore.filterOformsByLocale`.
 * (`./filter.js` is still `@ts-nocheck`, so its inferred `locale: null`
 * type is narrower than the runtime values.)
 */
export type TOformsFilter = Omit<OformsFilter, "locale"> & {
  locale: string | null;
  icon?: string;
};
