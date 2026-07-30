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

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import type RoomsFilter from "@docspace/shared/api/rooms/filter";
import type { TAIConfig, TGetAgents } from "@docspace/shared/api/ai/types";
import { logger } from "@/../logger.mjs";

export async function getAIAgents(
  filter: RoomsFilter,
): Promise<TGetAgents | undefined> {
  // Node AI service: returns the DocSpace envelope for /ai/agents and
  // injects profile bindings; product (ai-agents) reads agents from here.
  const path = `/ai/agents?${filter.toApiUrlParams()}`;
  logger.debug(`Start GET ${path}`);

  try {
    const [req] = await createRequest([path], [["", ""]], "GET");
    const res = await fetch(req, {
      // List of agents is user-specific and mutates from anywhere — don't
      // cache. Same posture as the client-side fetchAgents (no revalidate).
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET ${path} failed: ${res.status}`);
      return;
    }

    const json = await res.json();
    return json.response as TGetAgents;
  } catch (error) {
    logger.error(`Error in getAIAgents: ${error}`);
  }
}

export async function getAIConfig(): Promise<TAIConfig | undefined> {
  logger.debug("Start GET /ai/config");

  try {
    const [req] = await createRequest(["/ai/config"], [["", ""]], "GET");
    const res = await fetch(req, {
      // Provider/AI portal config can flip via socket `change-ai-config` —
      // a short revalidate keeps SSR fresh while still saving most hits.
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET /ai/config failed: ${res.status}`);
      return;
    }

    const json = await res.json();
    return json.response as TAIConfig;
  } catch (error) {
    logger.error(`Error in getAIConfig: ${error}`);
  }
}
