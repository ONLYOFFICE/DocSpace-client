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

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading } from "@docspace/ui-kit/components/heading";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ComboBox, TOption } from "@docspace/ui-kit/components/combobox";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { DropDownItem } from "@docspace/ui-kit/components/drop-down-item";

import { TModel } from "@docspace/shared/api/ai/types";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import { TTranslation } from "@docspace/shared/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { getBrandName } from "@docspace/shared/constants/brands";

import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import ServicesStore from "SRC_DIR/store/ServicesStore";

import styles from "../AISettings.module.scss";

import { ProvidersLoader } from "./ProvidersLoader";

type ModelAssignmentProps = {
  aiProvidersInitied?: AISettingsStore["aiProvidersInitied"];
  aiProviders?: AISettingsStore["aiProviders"];
  defaultProviderModels?: AISettingsStore["defaultProviderModels"];
  defaultProvider?: AISettingsStore["defaultProvider"];
  isDefaultProviderModelsLoading?: AISettingsStore["isDefaultProviderModelsLoading"];
  changeDefaultProvider?: AISettingsStore["changeDefaultProvider"];
  aiConfig?: SettingsStore["aiConfig"];
  formatAiModelsCurrency?: ServicesStore["formatAiModelsCurrency"];
};

const getSelectedModelOption = (
  t: TTranslation,
  models?: TModel[] | null,
  selectedModelId?: string | null,
): TOption => {
  if (!models?.length || !selectedModelId)
    return { key: "-2", label: t("Common:NoModelsFound") };

  const model = models.find((m) => m.modelId === selectedModelId) || models[0];

  if (!model) return { key: "-2", label: t("Common:NoModelsFound") };

  return {
    key: model.modelId,
    label: model.alias || model.modelId,
  };
};

const ModelAssignmentComponent = ({
  aiProvidersInitied,
  aiConfig,
  aiProviders,
  defaultProviderModels,
  defaultProvider,
  isDefaultProviderModelsLoading,
  changeDefaultProvider,
  formatAiModelsCurrency,
}: ModelAssignmentProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);
  const tooltipId = useId();

  const providerId = defaultProvider?.providerId || null;

  const isOnlySystemProvider =
    aiProviders?.length === 1 && aiProviders[0].type === ProviderType.PortalAi;
  const isDisabled = isOnlySystemProvider && !aiConfig?.systemAiEnabled;

  const isSystemProviderSelected = aiProviders?.some(
    (p) => p.id === providerId && p.type === ProviderType.PortalAi,
  );

  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    defaultProvider?.defaultModel || null,
  );
  const [isSaveRequestRunning, setIsSaveRequestRunning] = useState(false);
  const prevDefaultModelRef = useRef(defaultProvider?.defaultModel);

  useEffect(() => {
    if (prevDefaultModelRef.current !== defaultProvider?.defaultModel) {
      setSelectedModelId(defaultProvider?.defaultModel || null);
      prevDefaultModelRef.current = defaultProvider?.defaultModel;
    }
  }, [defaultProvider?.defaultModel]);

  const getTooltipContent = () => (
    <Text fontSize="12px" lineHeight="16px">
      {t("AISettings:PortalAiDisabledTooltip", {
        productName: getBrandName("ProductName"),
      })}
    </Text>
  );

  const onSelectModel = async (option: TOption) => {
    if (option.key === selectedModelId || !providerId) return;

    const newModelId = option.key as string;
    const prevModelId = selectedModelId;

    setSelectedModelId(newModelId);
    setIsSaveRequestRunning(true);

    try {
      await changeDefaultProvider?.({ providerId, defaultModel: newModelId }, t);
    } catch {
      setSelectedModelId(prevModelId);
    } finally {
      setIsSaveRequestRunning(false);
    }
  };

  const getModelOptions = () => {
    return (
      defaultProviderModels?.map((m) => ({
        key: m.modelId,
        label: m.alias || m.modelId,
      })) || []
    );
  };

  const getModelAdvancedOptions = () => {
    if (!defaultProviderModels?.length) return undefined;

    return (
      <div style={{ display: "contents" }}>
        {defaultProviderModels.map((m) => {
          const label = m.alias || m.modelId;
          const isSelected = m.modelId === selectedModelId;
          const safeFormat = (v: number) =>
            formatAiModelsCurrency ? formatAiModelsCurrency(v) : String(v);
          const priceLabel =
            m.price != null
              ? t("Common:AIModelPrice", {
                  inputPrice: safeFormat(m.price.prompt),
                  outputPrice: safeFormat(m.price.completion),
                })
              : null;

          return (
            <DropDownItem
              key={m.modelId}
              isSelected={isSelected}
              isActive={isSelected}
              onClick={() => onSelectModel({ key: m.modelId, label })}
            >
              <div className={styles.modelOption}>
                <Text className={styles.modelLabel}>{label}</Text>
                {priceLabel ? (
                  <Text className={styles.modelDescription}>{priceLabel}</Text>
                ) : null}
              </div>
            </DropDownItem>
          );
        })}
      </div>
    );
  };

  if (!aiProvidersInitied) return <ProvidersLoader />;

  const selectedModelOption = getSelectedModelOption(
    t,
    defaultProviderModels,
    selectedModelId,
  );

  const isComboBoxLoading =
    isDefaultProviderModelsLoading || isSaveRequestRunning;

  return (
    <div className={styles.aiProvider}>
      <div
        className={styles.defaultAISetup}
        data-tooltip-id={isDisabled ? tooltipId : undefined}
      >
        <Heading
          className={styles.heading}
          level={3}
          fontWeight={700}
          lineHeight="22px"
          fontSize="16px"
        >
          {t("AISettings:DefaultAISetupTitle")}
        </Heading>
        <Text className={styles.description} lineHeight="20px">
          {t("AISettings:DefaultAISetupDescription")}
        </Text>

        <FieldContainer
          className={styles.defaultAISetupForm}
          labelVisible
          isVertical
          labelText={t("AISettings:Model")}
          removeMargin
        >
          {isSystemProviderSelected ? (
            <ComboBox
              onSelect={() => {}}
              options={[]}
              advancedOptions={getModelAdvancedOptions()}
              advancedOptionsCount={defaultProviderModels?.length ?? 0}
              selectedOption={selectedModelOption}
              displayArrow
              scaledOptions
              dataTestId="default-model-combobox"
              dropDownTestId="default-model-dropdown"
              isLoading={isComboBoxLoading}
              isDisabled={isDisabled || !defaultProviderModels}
              directionY="both"
              dropDownMaxHeight={260}
              isNoFixedHeightOptions
              displaySelectedOption
              hideMobileView={false}
              isDefaultMode
              dropDownClassName={styles.modelDropdown}
              textOverflow
            />
          ) : (
            <ComboBox
              options={getModelOptions()}
              selectedOption={selectedModelOption}
              displayArrow
              onSelect={onSelectModel}
              displaySelectedOption
              dataTestId="default-model-combobox"
              dropDownTestId="default-model-dropdown"
              isLoading={isComboBoxLoading}
              isDisabled={isDisabled || !defaultProviderModels?.length}
              directionY="both"
              dropDownMaxHeight={300}
              scaledOptions
              textOverflow
            />
          )}
        </FieldContainer>
      </div>
      {isDisabled ? (
        <Tooltip
          id={tooltipId}
          place="bottom"
          offset={10}
          float
          getContent={getTooltipContent}
        />
      ) : null}
    </div>
  );
};

export const ModelAssignment = inject(
  ({ aiSettingsStore, settingsStore, servicesStore }: TStore) => {
    return {
      aiProvidersInitied: aiSettingsStore.aiProvidersInitied,
      aiConfig: settingsStore.aiConfig,
      defaultProviderModels: aiSettingsStore.defaultProviderModels,
      defaultProvider: aiSettingsStore.defaultProvider,
      aiProviders: aiSettingsStore.aiProviders,
      isDefaultProviderModelsLoading:
        aiSettingsStore.isDefaultProviderModelsLoading,
      changeDefaultProvider: aiSettingsStore.changeDefaultProvider,
      formatAiModelsCurrency: servicesStore.formatAiModelsCurrency,
    };
  },
)(observer(ModelAssignmentComponent));
