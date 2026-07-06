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

import React from "react";
import { useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import axios from "axios";

import { Text } from "@docspace/ui-kit/components/text";
import type {
  TAIConfig,
  TAiProvider,
  TModel,
} from "@docspace/shared/api/ai/types";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import {
  getDefaultProvider,
  getModels,
  getProviders,
} from "@docspace/shared/api/ai";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { RecomendedModel } from "@docspace/ui-kit/ai-agent/recomended-model";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";
import { modelCache } from "./modelCache";
import { ProviderType } from "@docspace/shared/api/ai/enums";

type ModelSaasProps = {
  agentParams: TAgentParams;
  systemAiEnabled?: TAIConfig["systemAiEnabled"];
  recommendedModelForForms?: TAIConfig["recommendedModelForForms"];
  isAdmin?: boolean;
  openedFromChat?: boolean;
  setAgentParams: (value: Partial<TAgentParams>) => void;
};

const ModelSaas = ({
  agentParams,
  systemAiEnabled,
  recommendedModelForForms,
  isAdmin,
  openedFromChat,
  setAgentParams,
}: ModelSaasProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const onOpenSettings = React.useCallback(() => {
    navigate("/portal-settings/ai-settings/providers");
  }, [navigate]);

  const [provider, setProvider] = React.useState<TAiProvider | null>(null);
  const [models, setModels] = React.useState<TModel[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<TModel | null>(
    agentParams.modelId ? ({ modelId: agentParams.modelId } as TModel) : null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isProviderLoading, setIsProviderLoading] = React.useState(true);
  const [isModelsLoading, setIsModelsLoading] = React.useState(true);

  const prevSelectedModel = React.useRef<TModel | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const pickProvider = (list: TAiProvider[]) => {
      const defaultProviderId = modelCache.getDefaultProvider()?.providerId;
      return list.find((pr) => pr.id === defaultProviderId) ?? list[0] ?? null;
    };

    const resolveProvider = async () => {
      if (
        modelCache.getProviders() &&
        systemAiEnabled === modelCache.isAiServiceEnable()
      ) {
        setProvider(pickProvider(modelCache.getProviders()!));
        setIsProviderLoading(false);
        return;
      }

      try {
        const [list, defaultProvider] = await Promise.all([
          getProviders(),
          getDefaultProvider(),
        ]);

        modelCache.setProviders(list);
        modelCache.setDefaultProvider(defaultProvider);
        modelCache.setAiServiceEnable(systemAiEnabled ?? false);

        const enabled = list
          .filter((pr) => !pr.needReset)
          .filter((pr) => pr.type !== ProviderType.PortalAi || systemAiEnabled);

        if (!cancelled) setProvider(pickProvider(enabled));
      } catch (e) {
        if (!cancelled) toastr.error(e as string);
      } finally {
        if (!cancelled) setIsProviderLoading(false);
      }
    };

    resolveProvider();

    return () => {
      cancelled = true;
    };
  }, [systemAiEnabled]);

  // Load the provider's models and preselect one (the agent's current model,
  // the provider default, or the first available).
  React.useEffect(() => {
    if (!provider) return undefined;

    let cancelled = false;

    const preselect = (list: TModel[]) => {
      const defaultModel = modelCache.getDefaultProvider()?.defaultModel;
      const current = agentParams.modelId
        ? list.find((m) => m.modelId === agentParams.modelId)
        : null;

      setSelectedModel(
        current ??
          list.find((m) => m.modelId === defaultModel) ??
          list[0] ??
          null,
      );
    };

    const cached = modelCache.getModels(provider.id);
    if (cached) {
      setModels(cached);
      preselect(cached);
      setIsModelsLoading(false);
      return undefined;
    }

    setIsModelsLoading(true);
    getModels(provider.id)
      .then((list) => {
        if (cancelled) return;
        modelCache.setModels(provider.id, list);
        setModels(list);
        preselect(list);
      })
      .catch((e) => {
        if (cancelled) return;
        toastr.error(e as string);
        if (axios.isAxiosError(e))
          setError(e.response?.data?.error?.message ?? null);
        setSelectedModel(null);
      })
      .finally(() => {
        if (!cancelled) setIsModelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [provider]);

  const modelOptions = React.useMemo(() => {
    return models.map((model) => ({
      key: model.modelId,
      value: model.modelId,
      label: model.alias ?? model.modelId,
    }));
  }, [models]);

  const modelSelectedOptions = React.useMemo(() => {
    return selectedModel
      ? {
          key: selectedModel.modelId,
          value: selectedModel.modelId,
          label: selectedModel.alias ?? selectedModel.modelId,
        }
      : {
          key: "empty-selected-option",
          label: isModelsLoading ? "" : t("Common:NoModelsFound"),
        };
  }, [selectedModel, isModelsLoading, t]);

  const onSelectModel = React.useCallback(
    (option: TOption) => {
      const model = models.find((m) => m.modelId === option.key);

      if (!model) return;

      setSelectedModel(model);
    },
    [models],
  );

  const onSelectRecomendedModel = React.useCallback(() => {
    const recomended = models.find(
      (model) => model.modelId === recommendedModelForForms,
    );

    if (recomended) setSelectedModel(recomended);
  }, [models, recommendedModelForForms]);

  React.useEffect(() => {
    if (!selectedModel && !error) return;

    if (!selectedModel && error) {
      setAgentParams({
        modelId: undefined,
      });
      prevSelectedModel.current = selectedModel;
      return;
    }

    const hasChanges =
      prevSelectedModel.current?.modelId !== selectedModel?.modelId ||
      prevSelectedModel.current?.providerId !== selectedModel?.providerId;

    if (!hasChanges || typeof selectedModel?.providerId !== "number") return;

    setAgentParams({
      modelId: selectedModel?.modelId,
      providerId: selectedModel?.providerId,
    });

    prevSelectedModel.current = selectedModel;
  }, [selectedModel, setAgentParams, error]);

  const isModelLoading = isProviderLoading || isModelsLoading;

  const modelIds = models.map((model) => model.modelId);

  // Show the recommendation banner only when the dialog was opened from the
  // chat recommendation banner, and not until the provider and models are
  // loaded (otherwise it briefly flashes the wrong, not-available state).
  const isRecomendationReady = openedFromChat && !isModelLoading;

  return (
    <StyledParam increaseGap>
      <div className=" set_room_params-info">
        <div>
          <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
            {t("Common:AIModelTitle")}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            {t("Common:AIModelDescription")}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            <Trans
              t={t}
              i18nKey="ResponseQualityNode"
              ns="Common"
              components={{
                1: <span style={{ fontWeight: 600 }} />,
              }}
            />
          </Text>
        </div>

        {isRecomendationReady ? (
          <RecomendedModel
            isAdmin={!!isAdmin}
            isChat={false}
            selectedModel={selectedModel?.modelId ?? ""}
            providerType={provider?.type}
            availableProviders={provider ? [provider.type] : []}
            modelList={modelIds}
            recomendedModel={recommendedModelForForms ?? ""}
            onOpenSettings={onOpenSettings}
            onSelectModel={onSelectRecomendedModel}
          />
        ) : null}

        <FieldContainer
          isVertical
          hasError={!!error}
          errorMessage={error || ""}
          errorMessageWidth="100%"
          removeMargin
        >
          <ComboBox
            options={modelOptions}
            selectedOption={modelSelectedOptions}
            onSelect={onSelectModel}
            scaled
            scaledOptions
            dropDownMaxHeight={modelOptions.length > 7 ? 300 : undefined}
            isDefaultMode
            className="ai-combobox"
            displaySelectedOption
            dropDownClassName="not-selectable"
            isDisabled={!!error || isModelLoading || !models.length}
            isLoading={isModelLoading}
            dataTestId="create_agent_model_combobox"
          />
        </FieldContainer>
      </div>
    </StyledParam>
  );
};

export default ModelSaas;

