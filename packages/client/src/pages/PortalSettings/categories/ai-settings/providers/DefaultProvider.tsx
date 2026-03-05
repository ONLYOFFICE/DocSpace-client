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

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Heading } from "@docspace/ui-kit/components/heading";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ComboBox, TOption } from "@docspace/ui-kit/components/combobox";

import { TAiProvider, TModel } from "@docspace/shared/api/ai/types";
import { TTranslation } from "@docspace/shared/types";

import styles from "../AISettings.module.scss";
import { inject, observer } from "mobx-react";
import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
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

  const { t } = useTranslation(["Common", "AISettings"]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    defaultProvider?.providerId || null,
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    defaultProvider?.defaultModel || null,
  );
  const [isSaveRequestRunning, setIsSaveRequestRunning] = useState(false);
  const prevDefaultProviderInitiedRef = useRef(defaultProviderInitied);

  const isProviderChanged = selectedProviderId !== defaultProvider?.providerId;
  const isModelChanged = selectedModelId !== defaultProvider?.defaultModel;

  const getProviderOptions = () => {
    return (
      aiProviders?.map((p) => ({
        key: p.id,
        label: p.title,
      })) || []
    );
  };

  const getModelOptions = () => {
    return (
      defaultProviderModels?.map((m) => ({
        key: m.modelId,
        label: aiConfig?.modelAliases?.[m.modelId] || m.modelId,
      })) || []
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
      setSelectedProviderId(defaultProvider?.providerId || null);
      setSelectedModelId(defaultProvider?.defaultModel || null);
    }

    prevDefaultProviderInitiedRef.current = defaultProviderInitied;
  }, [
    defaultProviderInitied,
    aiProviders,
    defaultProvider,
    defaultProviderModels,
    t,
  ]);

  return (
    <div className={styles.defaultProvider}>
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
            selectedOption={selectedProviderOption}
            displayArrow
            onSelect={onSelectProvider}
            displaySelectedOption
            dataTestId="default-provider-combobox"
            dropDownTestId="default-provider-dropdown"
            directionY="both"
            dropDownMaxHeight={300}
          />
        </FieldContainer>
        <FieldContainer
          labelVisible
          isVertical
          labelText={t("AISettings:Model")}
          removeMargin
        >
          <ComboBox
            options={getModelOptions()}
            selectedOption={selectedModelOption}
            displayArrow
            onSelect={onSelectModel}
            displaySelectedOption
            dataTestId="default-model-combobox"
            dropDownTestId="default-model-dropdown"
            isLoading={isDefaultProviderModelsLoading}
            isDisabled={!defaultProviderModels}
            directionY="both"
            dropDownMaxHeight={300}
          />
        </FieldContainer>

        <div className={styles.defaultProviderFormButtons}>
          <Button
            primary
            size={ButtonSize.small}
            label={t("Common:SaveButton")}
            scale={false}
            onClick={onSave}
            isLoading={isSaveRequestRunning}
            isDisabled={isSaveDisabled}
            testId="default-provider-save-button"
          />
          <Button
            size={ButtonSize.small}
            label={t("Common:CancelButton")}
            scale={false}
            onClick={onCancel}
            isDisabled={isCancelDisabled}
            testId="default-provider-cancel-button"
          />
        </div>
      </div>
    </div>
  );
};

export const DefaultProvider = inject(({ aiSettingsStore }: TStore) => {
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
  };
})(observer(DefaultProviderComponent));
