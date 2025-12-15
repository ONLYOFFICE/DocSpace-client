// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { TDocEditor } from "@/types";
import { getProviders, getModels } from "@docspace/shared/api/ai";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import type { TAiProvider } from "@docspace/shared/api/ai/types";

const getProviderTypeString = (type: ProviderType): string => {
  switch (type) {
    case ProviderType.OpenAi:
      return "openai";
    case ProviderType.TogetherAi:
      return "togetherai";
    case ProviderType.OpenAiCompatible:
      return "openaicompatible";
    case ProviderType.Anthropic:
      return "anthropic";
    case ProviderType.OpenRouter:
      return "openrouter";
    default:
      return "openai";
  }
};

const initProxy = async (docEditor: TDocEditor | null, product: string) => {
  if (!docEditor) return;

  const portalProviders = await getProviders();

  if (!portalProviders) return;

  if (!window.ClientConfig?.api) return;

  const { origin, prefix } = window.ClientConfig.api;

  const providers = await Promise.all(
    portalProviders.map(async ({ id, title, type }: TAiProvider) => {
      const models = await getModels(id);
      const providerType = getProviderTypeString(type);
      const baseProxyUrlTemplate = `${origin}${prefix}/ai/${providerType}/${id}`;
      const modelsList = models?.map((model) => model.modelId) || [];
      const providerName = product !== "" ? `${product} [${title}]` : title;

      return {
        name: providerName,
        url: baseProxyUrlTemplate,
        key: "",
        addon: "v1",
        models: modelsList,
      };
    }),
  );

  const connector = docEditor.createConnector?.();

  const modelName = `${providers[0].name} [${providers[0].models[0]}]`;

  const pluginSettings = {
    settingsLock: undefined,
    actionsOverride: true,
    actions: {
      Chat: {
        model: modelName,
        capabilities: 1,
      },
      Summarization: {
        model: modelName,
        capabilities: 1,
      },
      Translation: {
        model: modelName,
        capabilities: 1,
      },
      TextAnalyze: {
        model: modelName,
        capabilities: 1,
      },
    },
    providers,
    models: [
      {
        capabilities: 1,
        provider: providers[0].name,
        name: modelName,
        id: providers[0].models[0],
      },
    ],
  };

  connector?.executeMethod("AI", [{ type: "Actions" }], (data) => {
    if (data && typeof data === "object" && "error" in data && data.error) {
      connector?.attachEvent("ai_onInit", () => {
        setTimeout(() => {
          connector?.sendEvent("ai_onCustomInit", pluginSettings);
        }, 200);
      });
    } else {
      connector?.sendEvent("ai_onCustomInit", pluginSettings);
    }
  });
};

export default initProxy;
