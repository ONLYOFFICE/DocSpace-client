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

import { http } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_AI_MODELS = "ai/chats/models";

const providerClaude = {
  response: [
    {
      providerId: 1,
      providerTitle: "Claude AI",
      modelId: "claude-opus-4-5-20251101",
      alias: "Claude Opus 4.5",
    },
    {
      providerId: 1,
      providerTitle: "Claude AI",
      modelId: "claude-haiku-4-5-20251001",
      alias: "Claude Haiku 4.5",
    },
    {
      providerId: 1,
      providerTitle: "Claude AI",
      modelId: "claude-sonnet-4-5-20250929",
      alias: "Claude Sonnet 4.5",
    },
  ],
  count: 3,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_MODELS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const providerOpenAI = {
  response: [
    {
      providerId: 2,
      providerTitle: "OpenAI",
      modelId: "gpt-5.1-2025-11-13",
      alias: "GPT-5.1",
    },
    {
      providerId: 2,
      providerTitle: "OpenAI",
      modelId: "gpt-5",
      alias: "GPT-5",
    },
    {
      providerId: 2,
      providerTitle: "OpenAI",
      modelId: "gpt-4.1",
      alias: "GPT-4.1",
    },
  ],
  count: 3,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_MODELS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const providerTogetherAI = {
  response: [
    {
      providerId: 3,
      providerTitle: "Together AI",
      modelId: "deepseek-ai/DeepSeek-V3.1",
    },
    {
      providerId: 3,
      providerTitle: "Together AI",
      modelId: "Qwen/Qwen3-235B-A22B-fp8-tput",
    },
  ],
  count: 3,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_MODELS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const providerOpenRouter = {
  response: [
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "anthropic/claude-opus-4.5",
    },
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "openai/gpt-5.1",
    },
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "anthropic/claude-haiku-4.5",
    },
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "anthropic/claude-sonnet-4.5",
    },
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "qwen/qwen3-max",
    },
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "deepseek/deepseek-v3.1-terminus",
    },
    {
      providerId: 4,
      providerTitle: "OpenRouter",
      modelId: "x-ai/grok-4",
    },
  ],
  count: 3,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_MODELS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const errorRes = {
  error: {
    message:
      "The specified API key is invalid or does not have access rights. Verify that the key is correct and try again",
    type: "System.ArgumentException",
    stack: "stack",
    hresult: -1234567589,
  },
  status: 1,
  statusCode: 400,
};

export const aiModelsResolver = (
  isClaude?: boolean,
  isOpenAI?: boolean,
  isTogetherAI?: boolean,
  isOpenRouter?: boolean,
  isError?: boolean,
) => {
  if (isClaude) {
    return new Response(JSON.stringify(providerClaude));
  }

  if (isOpenAI) {
    return new Response(JSON.stringify(providerOpenAI));
  }

  if (isTogetherAI) {
    return new Response(JSON.stringify(providerTogetherAI));
  }

  if (isOpenRouter) {
    return new Response(JSON.stringify(providerOpenRouter));
  }

  if (isError) {
    return new Response(JSON.stringify(errorRes), {
      status: errorRes.statusCode,
    });
  }

  return new Response(JSON.stringify(providerOpenAI));
};

export const aiModelsHandler = (
  port: string,
  {
    isClaude,
    isOpenAI,
    isTogetherAI,
    isOpenRouter,
    isError,
  }: {
    isClaude?: boolean;
    isOpenAI?: boolean;
    isTogetherAI?: boolean;
    isOpenRouter?: boolean;
    isError?: boolean;
  } = {},
) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_MODELS}`, () => {
    return aiModelsResolver(
      isClaude,
      isOpenAI,
      isTogetherAI,
      isOpenRouter,
      isError,
    );
  });
};
