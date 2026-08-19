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

import { Trans } from "react-i18next";
import type { TFunction } from "i18next";

import { Link, LinkType } from "@docspace/ui-kit/components/link";

import { ProviderType } from "../../api/ai/enums";

const SERVICES_URL = "/portal-settings/payments/services";

const onServicesClick = () => {
  window.DocSpace.navigate(SERVICES_URL);
};

const OPENAI_LABEL = "OpenAI";
const TOGETHER_AI_LABEL = "TogetherAI";
const OPENAI_COMPATIBLE_LABEL = "Custom";
const ANTHROPIC_LABEL = "Anthropic";
const OPENROUTER_LABEL = "OpenRouter";
const DEEPSEEK_LABEL = "DeepSeek";
const XAI_LABEL = "xAI";
const GOOGLE_LABEL = "Google AI";

export const getAiProviderLabel = (
  type: ProviderType,
  t?: TFunction,
  enabled?: boolean,
): React.ReactNode => {
  switch (type) {
    case ProviderType.OpenAi:
      return OPENAI_LABEL;
    case ProviderType.TogetherAi:
      return TOGETHER_AI_LABEL;
    case ProviderType.OpenAiCompatible:
      return OPENAI_COMPATIBLE_LABEL;
    case ProviderType.Anthropic:
      return ANTHROPIC_LABEL;
    case ProviderType.OpenRouter:
      return OPENROUTER_LABEL;
    case ProviderType.DeepSeek:
      return DEEPSEEK_LABEL;
    case ProviderType.XAi:
      return XAI_LABEL;
    case ProviderType.Google:
      return GOOGLE_LABEL;
    case ProviderType.PortalAi:
      return enabled ? (
        (t?.("Common:BuiltInAIService") ?? "")
      ) : (
        <Trans
          t={t}
          i18nKey="Common:BuiltInAIServiceDisabled"
          components={{
            1: (
              <Link
                type={LinkType.action}
                color="accent"
                isHovered
                onClick={onServicesClick}
              />
            ),
          }}
        />
      );
    default:
      return "";
  }
};

