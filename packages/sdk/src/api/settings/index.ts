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

import {
  TCapabilities,
  TGetColorTheme,
  TPortalCultures,
  TSettings,
  TVersionBuild,
} from "@docspace/shared/api/settings/types";
import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import { logger } from "@/../logger.mjs";

export async function getSettings(
  withPassword = false,
): Promise<TSettings | string | undefined> {
  logger.debug(`Start GET /settings?withPassword=${withPassword}`);

  try {
    const [req] = await createRequest(
      [`/settings?withPassword=${withPassword}`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(req, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 403) {
      logger.error(
        `GET /settings?withPassword=${withPassword} failed: ${res.status}`,
      );
      return `access-restricted`;
    }

    if (res.status === 404) {
      logger.error(
        `GET /settings?withPassword=${withPassword} failed: ${res.status}`,
      );
      return "portal-not-found";
    }

    if (!res.ok) {
      logger.error(
        `GET /settings?withPassword=${withPassword} failed: ${res.status}`,
      );
      return;
    }

    const settings = await res.json();

    return settings.response;
  } catch (error) {
    logger.error(`Error in getSettings: ${error}`);
  }
}

export async function getColorTheme(): Promise<TGetColorTheme | undefined> {
  logger.debug("Start GET /settings/colortheme");

  try {
    const [req] = await createRequest(
      [`/settings/colortheme`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(req, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET /settings/colortheme failed: ${res.status}`);
      return;
    }

    const colorTheme = await res.json();

    return colorTheme.response;
  } catch (error) {
    logger.error(`Error in getColorTheme: ${error}`);
  }
}

export async function getBuildInfo() {
  logger.debug("Start GET /settings/version/build");

  try {
    const [req] = await createRequest(
      [`/settings/version/build`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(req, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET /settings/version/build failed: ${res.status}`);
      return;
    }

    const buildInfo = await res.json();

    return buildInfo as TVersionBuild;
  } catch (error) {
    logger.error(`Error in getBuildInfo: ${error}`);
  }
}

export async function getCapabilities() {
  logger.debug("Start GET /capabilities");

  try {
    const [req] = await createRequest([`/capabilities`], [["", ""]], "GET");

    const res = await fetch(req, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET /capabilities failed: ${res.status}`);
      return;
    }

    const capabilities = await res.json();

    return capabilities.response as TCapabilities;
  } catch (error) {
    logger.error(`Error in getCapabilities: ${error}`);
  }
}

export async function getPortalCultures(): Promise<TPortalCultures> {
  logger.debug("Start GET /settings/cultures");

  try {
    const [getPortalCulturesRes] = await createRequest(
      [`/settings/cultures`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(getPortalCulturesRes, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET /settings/cultures failed: ${res.status}`);
      throw new Error("Failed to get portal cultures");
    }

    const cultures = await res.json();

    return cultures.response;
  } catch (error) {
    logger.error(`Error in getPortalCultures: ${error}`);
    throw error;
  }
}
