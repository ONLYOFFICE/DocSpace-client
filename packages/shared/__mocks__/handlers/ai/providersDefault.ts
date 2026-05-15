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

import {http} from "msw";
import {API_PREFIX, BASE_URL} from "../../e2e/utils";

export const PATH_AI_PROVIDERS_DEFAULT = "ai/providers/default";

export const aiProvidersDefaultResolver = ({isNewProvider, isUpdatedProvider, isClaude, isOpenAI}: {
  isNewProvider?: boolean,
  isUpdatedProvider?: boolean,
  isClaude?: boolean,
  isOpenAI?: boolean
}) => {
  let response = null;

  if (isNewProvider) {
    response = {
      providerId: 2,
      defaultModel: "gpt-5.1-2025-11-13",
      providerTitle: "new provider",
    }
  } else if (isUpdatedProvider) {
    response = {
      providerId: 2,
      defaultModel: "gpt-5.1-2025-11-13",
      providerTitle: "updated provider",
    }
  } else if (isOpenAI) {
    response = {
      providerId: 2,
      defaultModel: "gpt-5.1-2025-11-13",
      providerTitle: "OpenAI",
    }
  } else {
    response = {
      providerId: 1,
      defaultModel: "claude-opus-4-5-20251101",
      providerTitle: "Claude AI",
    }
  }

  return new Response(JSON.stringify(
    {
      response,
      status: 0,
      statusCode: 200,
    }
  ));
};

export const aiProvidersDefaultHandler = (
  port: string,
  data: { isNewProvider?: boolean, isUpdatedProvider?: boolean, isClaude?: boolean, isOpenAI?: boolean }
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_PROVIDERS_DEFAULT}`,
    () => aiProvidersDefaultResolver(data),
  );
};
