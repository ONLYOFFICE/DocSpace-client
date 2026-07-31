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

import AnthropicSvgUrl from "PUBLIC_DIR/images/ai-providers/anthropic.svg?url";
import DeepSeekSvgUrl from "PUBLIC_DIR/images/ai-providers/deepseek.svg?url";
import GoogleSvgUrl from "PUBLIC_DIR/images/ai-providers/google_ai.svg?url";
import OllamaSvgUrl from "PUBLIC_DIR/images/ai-providers/ollama.svg?url";
import OpenaiSvgUrl from "PUBLIC_DIR/images/ai-providers/openai.svg?url";
import OpenRouterSvgUrl from "PUBLIC_DIR/images/ai-providers/openrouter.svg?url";
import TogetherAiSvgUrl from "PUBLIC_DIR/images/ai-providers/together_ai.svg?url";
import XaiSvgUrl from "PUBLIC_DIR/images/ai-providers/xai.svg?url";

import { ProviderType } from "../../api/ai/enums";
import { getLogoUrl } from "../common";
import { WhiteLabelLogoType } from "../../enums";

export const getAiProviderIcon = (type: ProviderType, isBase?: boolean) => {
  switch (type) {
    case ProviderType.Anthropic:
      return AnthropicSvgUrl;
    case ProviderType.OpenAi:
      return OpenaiSvgUrl;
    case ProviderType.TogetherAi:
      return TogetherAiSvgUrl;
    case ProviderType.OpenAiCompatible:
      return OllamaSvgUrl;
    case ProviderType.OpenRouter:
      return OpenRouterSvgUrl;
    case ProviderType.DeepSeek:
      return DeepSeekSvgUrl;
    case ProviderType.XAi:
      return XaiSvgUrl;
    case ProviderType.Google:
      return GoogleSvgUrl;
    case ProviderType.PortalAi:
      return "/logo.ashx?logotype=3";
    default:
      return "/logo.ashx?logotype=3";
  }
};

