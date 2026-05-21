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
import { Trans, useTranslation } from "react-i18next";
import axios from "axios";
import classNames from "classnames";

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
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";
import { modelCache } from "./modelCache";
import { ProviderType } from "@docspace/shared/api/ai/enums";

type ModelSettingsProps = {
  agentParams: TAgentParams;
  systemAiEnabled?: TAIConfig["systemAiEnabled"];
  setAgentParams: (value: Partial<TAgentParams>) => void;
};

const ModelSettings = ({
  agentParams,
  systemAiEnabled,
  setAgentParams,
}: ModelSettingsProps) => {
  const { t } = useTranslation(["AIRoom", "Common"]);

  const [providers, setProviders] = React.useState<TAiProvider[]>([]);
  const [models, setModels] = React.useState<TModel[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedProvider, setSelectedProvider] = React.useState<TAiProvider>({
    id: agentParams.providerId || -2,
  } as TAiProvider);
  const [selectedModel, setSelectedModel] = React.useState<TModel | null>({
    modelId: agentParams.modelId ?? "",
  } as TModel);

  const initProviderIdRef = React.useRef<number | null>(
    agentParams.providerId || null,
  );
  const initModelIdRef = React.useRef<string | null>(
    agentParams.modelId || null,
  );

  const [isProvidersLoading, setIsProvidersLoading] = React.useState(false);
  const [isProvidersFetched, setIsProvidersFetched] = React.useState(false);
  const [isModelsLoading, setIsModelsLoading] = React.useState(false);
  const [isModelsFetched, setIsModelsFetched] = React.useState(false);
  const [hasProviderBeenSwitched, setHasProviderBeenSwitched] =
    React.useState(false);

  const prevSelectedModel = React.useRef<TModel | null>(null);

  React.useEffect(() => {
    const defaultProvider = modelCache.getDefaultProvider();
    const cachedProviders = modelCache.getProviders();
    if (cachedProviders) {
      setProviders(cachedProviders);
      setIsProvidersFetched(true);

      if (selectedProvider.id === -2) {
        const preferredProvider = cachedProviders.find(
          (pr) => pr.id === defaultProvider?.providerId,
        );
        setSelectedProvider(preferredProvider || cachedProviders[0]);
      } else {
        const provider = cachedProviders.find(
          (pr) => pr.id === selectedProvider.id,
        );
        if (provider) {
          setSelectedProvider(provider);
        }
      }
    }
  }, []);

  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsProvidersLoading(true);

        const [p, defaultProvider] = await Promise.all([
          getProviders(),
          getDefaultProvider(),
        ]);

        const enabledProviders = p
          .filter((pr) => !pr.needReset)
          .filter(
            (pr) =>
              pr.type !== ProviderType.PortalAi ||
              (pr.type === ProviderType.PortalAi && systemAiEnabled),
          );
        setProviders(enabledProviders);
        modelCache.setProviders(p);
        modelCache.setDefaultProvider(defaultProvider);
        modelCache.setAiServiceEnable(systemAiEnabled ?? false);

        setIsProvidersFetched(true);

        if (selectedProvider.id === -2) {
          const preferredProvider = enabledProviders.find(
            (pr) => pr.id === defaultProvider?.providerId,
          );
          setSelectedProvider(preferredProvider || enabledProviders[0]);
        } else {
          const provider = enabledProviders.find(
            (pr) => pr.id === selectedProvider.id,
          );

          if (!provider) {
            setSelectedProvider(enabledProviders[0]);
            return;
          }

          setSelectedProvider(provider);
        }
      } catch (e) {
        toastr.error(e as string);
      } finally {
        setIsProvidersLoading(false);
        setIsProvidersFetched(true);
      }
    };

    if (
      modelCache.getProviders() &&
      systemAiEnabled === modelCache.isAiServiceEnable()
    )
      return;

    if (providers.length || isProvidersLoading || isProvidersFetched) return;

    fetchProviders();
  }, [
    selectedProvider?.id,
    providers.length,
    isProvidersLoading,
    isProvidersFetched,
    systemAiEnabled,
  ]);

  React.useEffect(() => {
    const defaultModel = modelCache.getDefaultProvider()?.defaultModel;

    const fetchModels = async () => {
      try {
        const m = await getModels(selectedProvider?.id);
        setModels(m);
        modelCache.setModels(selectedProvider.id, m);

        if (selectedModel?.modelId) {
          const model = m.find((mo) => mo.modelId === selectedModel.modelId);

          if (!model) {
            const preferredModel = m.find((mo) => mo.modelId === defaultModel);
            setSelectedModel(preferredModel || m[0] || null);
            return;
          }

          setSelectedModel(model);
        } else {
          const preferredModel = m.find((mo) => mo.modelId === defaultModel);
          setSelectedModel(preferredModel || m[0] || null);
        }
      } catch (e) {
        toastr.error(e as string);

        if (axios.isAxiosError(e)) {
          setError(e.response?.data?.error?.message);
        }
      }
    };

    if (typeof selectedProvider?.id !== "number" || selectedProvider.id === -2)
      return;

    const cachedModels = modelCache.getModels(selectedProvider.id);

    if (cachedModels) {
      setModels(cachedModels);

      if (selectedModel?.modelId) {
        const model = cachedModels.find(
          (mo) => mo.modelId === selectedModel.modelId,
        );
        if (model) {
          setSelectedModel(model);
        } else {
          setSelectedModel(cachedModels[0] ?? null);
        }
      } else {
        const preferredModelId =
          selectedProvider?.id === initProviderIdRef.current
            ? initModelIdRef.current
            : defaultModel;

        const preferredModel =
          cachedModels.find((mo) => mo.modelId === preferredModelId) ??
          cachedModels[0] ??
          null;

        setSelectedModel(preferredModel);
      }

      setIsModelsLoading(false);
      setIsModelsFetched(true);
      return;
    }

    setSelectedModel(null);
    setIsModelsLoading(true);
    setIsModelsFetched(false);
    fetchModels().finally(() => {
      setIsModelsLoading(false);
      setIsModelsFetched(true);
    });
  }, [selectedProvider?.id]);

  const providerOptions = React.useMemo(() => {
    return providers.map((provider) => ({
      key: provider.id,
      value: provider.id,
      label: provider.title,
    }));
  }, [providers]);

  const providerSelectedOption = React.useMemo(() => {
    return selectedProvider
      ? {
          key: selectedProvider.id,
          value: selectedProvider.id,
          label: selectedProvider.title,
        }
      : {
          key: "empty-selected-option",
          label: "",
        };
  }, [selectedProvider]);

  const onSelectProvider = React.useCallback(
    (option: TOption) => {
      const provider = providers.find((p) => p.id === option.key);

      if (!provider || provider.id === selectedProvider.id) return;

      setSelectedProvider(provider);
      setSelectedModel(null);
      setError(null);
      setIsModelsLoading(true);
      setIsModelsFetched(false);
      setHasProviderBeenSwitched(true);
    },
    [providers, selectedProvider.id],
  );

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

  const isModelLoading =
    isModelsLoading ||
    (!isModelsFetched &&
      !selectedModel?.modelId &&
      !error &&
      !hasProviderBeenSwitched);

  return (
    <StyledParam increaseGap>
      <div className=" set_room_params-info">
        <div>
          <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
            {t("AIProviderAndModel", {
              aiProvider: t("Common:AIProvider"),
            })}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            {t("ModelDescription", {
              aiProvider: t("Common:AIProvider"),
            })}
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
              ns="AIRoom"
              components={{
                1: <span style={{ fontWeight: 600 }} />,
              }}
            />
          </Text>
        </div>
        {isProvidersLoading ? (
          <RectangleSkeleton width="100%" height="32px" />
        ) : (
          <FieldContainer
            isVertical
            hasError={!!error}
            errorMessage={error || ""}
            errorMessageWidth="100%"
            removeMargin
          >
            <ComboBox
              options={providerOptions}
              selectedOption={providerSelectedOption}
              onSelect={onSelectProvider}
              scaled
              scaledOptions
              dropDownMaxHeight={providerOptions.length > 7 ? 300 : undefined}
              noBorder={false}
              className={classNames("ai-combobox provider-combobox", {
                "has-error": !!error,
              })}
              displaySelectedOption
              dataTestId="create_agent_provider_combobox"
            />
          </FieldContainer>
        )}
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
      </div>
    </StyledParam>
  );
};

export default ModelSettings;
