/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import {
  TCapabilities,
  TGetColorTheme,
  TPortalCultures,
  TSettings,
  TVersionBuild,
} from "@docspace/shared/api/settings/types";
import { createRequest } from "@docspace/shared/utils/next-ssr-helper";

import {
  colorThemeHandler,
  portalCulturesHandler,
  settingsHandler,
} from "@docspace/shared/__mocks__/e2e";
import { logger } from "@/../logger.mjs";

const IS_TEST = process.env.E2E_TEST;

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

    const res = IS_TEST
      ? settingsHandler()
      : await fetch(req, { next: { revalidate: 300 } });

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

    const res = IS_TEST
      ? colorThemeHandler()
      : await fetch(req, { next: { revalidate: 300 } });

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

    const res = await fetch(req, { next: { revalidate: 300 } });

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

    const res = await fetch(req, { next: { revalidate: 300 } });

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

    const res = IS_TEST
      ? portalCulturesHandler()
      : await fetch(getPortalCulturesRes, { next: { revalidate: 300 } });

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
