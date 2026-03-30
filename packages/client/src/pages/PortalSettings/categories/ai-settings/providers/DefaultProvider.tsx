/*
 * (c) Copyright Ascensio System SIA 2009-2026
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

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Heading } from "@docspace/ui-kit/components/heading";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ComboBox, TOption } from "@docspace/ui-kit/components/combobox";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { DropDownItem } from "@docspace/ui-kit/components/drop-down-item";

import { TAiProvider, TModel } from "@docspace/shared/api/ai/types";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import { TTranslation } from "@docspace/shared/types";

import styles from "../AISettings.module.scss";
import { inject, observer } from "mobx-react";
import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import ServicesStore from "SRC_DIR/store/ServicesStore";
import classNames from "classnames";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

type DefaultProviderProps = {
  aiProviders?: AISettingsStore["aiProviders"];
  defaultProviderModels?: AISettingsStore["defaultProviderModels"];
  defaultProvider?: AISettingsStore["defaultProvider"];
  setDefaultProvider?: AISettingsStore["setDefaultProvider"];
  fetchDefaultProviderModels?: AISettingsStore["fetchDefaultProviderModels"];
  isDefaultProviderModelsLoading?: AISettingsStore["isDefaultProviderModelsLoading"];
  changeDefaultProvider?: AISettingsStore["changeDefaultProvider"];
  defaultProviderModelsError?: AISettingsStore["defaultProviderModelsError"];
  defaultProviderInitied?: AISettingsStore["defaultProviderInitied"];
  aiConfig?: SettingsStore["aiConfig"];
  formatAiModelsCurrency?: ServicesStore["formatAiModelsCurrency"];
};

const getSelectedProviderOption = (
  aiProviders?: TAiProvider[],
  selectedProviderId?: number | null,
): TOption => {
  if (!aiProviders || !selectedProviderId) return { key: "-2", label: "" };

  const provider =
    aiProviders.find((p) => p.id === selectedProviderId) || aiProviders[0];
  return { key: provider?.id, label: provider.title };
};

const DefaultProviderComponent = ({
  aiConfig,
  aiProviders,
  defaultProviderModels,
  defaultProvider,
  fetchDefaultProviderModels,
  isDefaultProviderModelsLoading,
  changeDefaultProvider,
  defaultProviderModelsError,
  defaultProviderInitied,
  formatAiModelsCurrency,
}: DefaultProviderProps) => {
  const getSelectedModelOption = (
    t: TTranslation,
    models?: TModel[] | null,
    selectedModelId?: string | null,
  ): TOption => {
    if (!models || !selectedModelId)
      return { key: "-2", label: t("Common:NoModelsFound") };

    const model =
      models.find((m) => m.modelId === selectedModelId) || models[0];

    return {
      key: model.modelId,
      label: aiConfig?.modelAliases?.[model.modelId] || model.modelId,
    };
  };

  const { t } = useTranslation(["Common", "AISettings", "Services"]);
  const tooltipId = useId();

  const isOnlySystemProvider =
    aiProviders?.length === 1 && aiProviders[0].type === ProviderType.PortalAi;
  const isDisabled = isOnlySystemProvider && !aiConfig?.systemAiEnabled;

  const getTooltipContent = () => (
    <Text fontSize="12px" lineHeight="16px">
      {t("AISettings:PortalAiDisabledTooltip", {
        productName: t("Common:ProductName"),
      })}
    </Text>
  );

  const getInitialProviderId = () => {
    const providerId = defaultProvider?.providerId || null;

    if (providerId && !aiConfig?.systemAiEnabled && aiProviders) {
      const current = aiProviders.find((p) => p.id === providerId);

      if (current?.type === ProviderType.PortalAi) {
        const fallback = aiProviders.find(
          (p) => p.type !== ProviderType.PortalAi,
        );

        return fallback?.id || providerId;
      }
    }

    return providerId;
  };

  const initialProviderId = getInitialProviderId();
  const needsFallback = initialProviderId !== defaultProvider?.providerId;

  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    initialProviderId,
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    needsFallback ? null : defaultProvider?.defaultModel || null,
  );
  const [isSaveRequestRunning, setIsSaveRequestRunning] = useState(false);
  const prevDefaultProviderInitiedRef = useRef(defaultProviderInitied);
  const fallbackFetchedRef = useRef(false);

  useEffect(() => {
    if (needsFallback && initialProviderId && !fallbackFetchedRef.current) {
      fallbackFetchedRef.current = true;
      fetchDefaultProviderModels?.(initialProviderId);
    }
  }, [needsFallback, initialProviderId, fetchDefaultProviderModels]);

  useEffect(() => {
    if (needsFallback && !selectedModelId && defaultProviderModels?.length) {
      setSelectedModelId(defaultProviderModels[0].modelId);
    }
  }, [needsFallback, selectedModelId, defaultProviderModels]);

  const isProviderChanged = selectedProviderId !== defaultProvider?.providerId;
  const isModelChanged = selectedModelId !== defaultProvider?.defaultModel;

  const getProviderOptions = () => {
    return (
      aiProviders?.map((p) => {
        const isProviderDisabled =
          p.type === ProviderType.PortalAi && !aiConfig?.systemAiEnabled;

        return {
          key: p.id,
          label: isProviderDisabled
            ? `${p.title} (${t("Common:ActivationRequired")})`
            : p.title,
          disabled: isProviderDisabled,
          withExternalLink: isProviderDisabled,
          externalLinkPath: isProviderDisabled
            ? "/portal-settings/payments/services"
            : undefined,
          onExternalLinkClick: isProviderDisabled
            ? () =>
                window.DocSpace?.navigate("/portal-settings/payments/services")
            : undefined,
        };
      }) || []
    );
  };

  const isSystemProviderSelected = aiProviders?.some(
    (p) => p.id === selectedProviderId && p.type === ProviderType.PortalAi,
  );

  const getModelOptions = () => {
    return (
      defaultProviderModels?.map((m) => ({
        key: m.modelId,
        label: aiConfig?.modelAliases?.[m.modelId] || m.modelId,
      })) || []
    );
  };

  const getModelAdvancedOptions = () => {
    if (!defaultProviderModels?.length) return undefined;

    return (
      <div style={{ display: "contents" }}>
        {defaultProviderModels.map((m) => {
          const label = aiConfig?.modelAliases?.[m.modelId] || m.modelId;
          const isSelected = m.modelId === selectedModelId;
          const safeFormat = (v: number) =>
            formatAiModelsCurrency ? formatAiModelsCurrency(v) : String(v);
          const priceLabel =
            m.price != null
              ? t("Services:AIModelPrice", {
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

  const selectedProviderOption = getSelectedProviderOption(
    aiProviders,
    selectedProviderId,
  );
  const selectedModelOption = getSelectedModelOption(
    t,
    defaultProviderModels,
    selectedModelId,
  );

  const onSave = async () => {
    if (!selectedProviderId || !selectedModelId) return;

    setIsSaveRequestRunning(true);
    const data = {
      providerId: selectedProviderId,
      defaultModel: selectedModelId,
    };

    await changeDefaultProvider?.(data, t);

    setIsSaveRequestRunning(false);
  };

  const onCancel = () => {
    if (!defaultProvider) return;

    setSelectedProviderId(defaultProvider.providerId);

    setSelectedModelId(defaultProvider.defaultModel);

    if (isProviderChanged) {
      fetchDefaultProviderModels?.(defaultProvider.providerId);
    }
  };

  const onSelectProvider = async (option: TOption) => {
    if (option.key === selectedProviderId) return;

    setSelectedProviderId(option.key as number);

    const models =
      (await fetchDefaultProviderModels?.(option.key as number)) || [];
    const hasDefaultModel =
      defaultProvider?.defaultModel &&
      models.some((m) => m.modelId === defaultProvider.defaultModel);
    const newModelId = hasDefaultModel
      ? defaultProvider.defaultModel
      : models[0]?.modelId;
    setSelectedModelId(newModelId || null);
  };

  const onSelectModel = (option: TOption) => {
    if (option.key === selectedModelId) return;

    setSelectedModelId(option.key as string);
  };

  const isSaveDisabled =
    (!isProviderChanged && !isModelChanged) ||
    isDefaultProviderModelsLoading ||
    !defaultProviderModels;
  const isCancelDisabled =
    (!isProviderChanged && !isModelChanged) ||
    isDefaultProviderModelsLoading ||
    !defaultProviderModels;

  useEffect(() => {
    const isNewInit =
      defaultProviderInitied === true &&
      prevDefaultProviderInitiedRef.current === false;

    if (isNewInit) {
      const providerId = getInitialProviderId();
      const isFallback = providerId !== defaultProvider?.providerId;

      setSelectedProviderId(providerId);
      setSelectedModelId(
        isFallback ? null : defaultProvider?.defaultModel || null,
      );

      if (isFallback && providerId) {
        fetchDefaultProviderModels?.(providerId);
      }
    }

    prevDefaultProviderInitiedRef.current = defaultProviderInitied;
  }, [
    defaultProviderInitied,
    aiProviders,
    defaultProvider,
    defaultProviderModels,
    aiConfig?.systemAiEnabled,
    t,
  ]);

  return (
    <>
      <div
        className={styles.defaultProvider}
        data-tooltip-id={isDisabled ? tooltipId : undefined}
      >
        <Heading
          className={styles.heading}
          level={3}
          fontWeight={700}
          lineHeight="22px"
          fontSize="16px"
        >
          {t("AISettings:DefaultProviderTitle")}
        </Heading>
        <Text className={styles.description} lineHeight="20px">
          {t("AISettings:DefaultProviderDescription", {
            aiProvider: t("Common:AIProvider"),
            aiAgents: t("Common:AIAgents"),
            productName: t("Common:ProductName"),
          })}
        </Text>

        <div className={styles.defaultProviderForm}>
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("AISettings:Provider")}
            removeMargin
            hasError={!!defaultProviderModelsError}
            errorMessage={defaultProviderModelsError || ""}
            errorMessageWidth="100%"
          >
            <ComboBox
              className={classNames({
                [styles.hasError]: !!defaultProviderModelsError,
              })}
              options={getProviderOptions()}
              showDisabledItems
              scaledOptions
              selectedOption={selectedProviderOption}
              displayArrow
              onSelect={onSelectProvider}
              displaySelectedOption
              isDisabled={isDisabled}
              dataTestId="default-provider-combobox"
              dropDownTestId="default-provider-dropdown"
              directionY="both"
              dropDownMaxHeight={300}
              textOverflow
            />
          </FieldContainer>
          <FieldContainer
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
                isLoading={isDefaultProviderModelsLoading}
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
                isLoading={isDefaultProviderModelsLoading}
                isDisabled={isDisabled || !defaultProviderModels}
                directionY="both"
                dropDownMaxHeight={300}
                scaledOptions
                textOverflow
              />
            )}
          </FieldContainer>

          <div className={styles.defaultProviderFormButtons}>
            <Button
              primary
              size={ButtonSize.small}
              label={t("Common:SaveButton")}
              scale={false}
              onClick={onSave}
              isLoading={isSaveRequestRunning}
              isDisabled={isDisabled || isSaveDisabled}
              testId="default-provider-save-button"
            />
            <Button
              size={ButtonSize.small}
              label={t("Common:CancelButton")}
              scale={false}
              onClick={onCancel}
              isDisabled={isDisabled || isCancelDisabled}
              testId="default-provider-cancel-button"
            />
          </div>
        </div>
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
    </>
  );
};

export const DefaultProvider = inject(
  ({ aiSettingsStore, servicesStore }: TStore) => {
    return {
      defaultProviderModels: aiSettingsStore.defaultProviderModels,
      defaultProvider: aiSettingsStore.defaultProvider,
      setDefaultProvider: aiSettingsStore.setDefaultProvider,
      aiProviders: aiSettingsStore.aiProviders,
      fetchDefaultProviderModels: aiSettingsStore.fetchDefaultProviderModels,
      isDefaultProviderModelsLoading:
        aiSettingsStore.isDefaultProviderModelsLoading,
      changeDefaultProvider: aiSettingsStore.changeDefaultProvider,
      defaultProviderModelsError: aiSettingsStore.defaultProviderModelsError,
      defaultProviderInitied: aiSettingsStore.defaultProviderInitied,
      formatAiModelsCurrency: servicesStore.formatAiModelsCurrency,
    };
  },
)(observer(DefaultProviderComponent));
