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

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import equal from "fast-deep-equal/react";
import classNames from "classnames";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import { modelCache } from "SRC_DIR/components/dialogs/CreateEditAgentDialog/sub-components/modelCache";
import { getAiProviderLabel } from "@docspace/shared/utils";
import type {
  TAiProvider,
  TCreateAiProvider,
  TModelCapabilities,
  TModelSettingsDto,
  TModelSettingsItem,
  TProviderModelInfo,
  TProviderTypeWithUrl,
  TUpdateAiProvider,
} from "@docspace/shared/api/ai/types";
import { type TData, toastr } from "@docspace/ui-kit/components/toast";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Text } from "@docspace/ui-kit/components/text";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "./AddUpdateDialog.module.scss";
import { useModelSelection } from "./useModelSelection";
import type { TModelSelectionState } from "./useModelSelection";
import { SelectedModelsList } from "./SelectedModelsList";
import { ModelSelectorPopup } from "./ModelSelectorPopup";
import { ModelSettingsPanel } from "./ModelSettingsPanel";

type AddEditDialogProps = {
  variant: "add" | "update";
  onClose: () => void;
  aiProviderTypesWithUrls: TProviderTypeWithUrl[];
  providerData?: TAiProvider;
  initialModels?: TModelSettingsDto[];
  addAIProvider?: AISettingsStore["addAIProvider"];
  updateAIProvider?: AISettingsStore["updateAIProvider"];
  getAIConfig?: SettingsStore["getAIConfig"];
};

const buildProviderOptions = (
  aiProviderTypesWithUrls: TProviderTypeWithUrl[],
): TOption[] =>
  aiProviderTypesWithUrls.map((item) => ({
    key: item.type,
    label: getAiProviderLabel(item.type),
  }));

const getSelectedOptionByProviderType = (
  options: TOption[],
  type?: ProviderType,
) => {
  return options.find((item) => item.key === type) || options[0];
};

const getURLByProviderType = (
  type: ProviderType,
  aiProviderTypesWithUrls: TProviderTypeWithUrl[],
) => {
  return aiProviderTypesWithUrls.find((item) => item.type === type)?.url || "";
};

const CUSTOM_PROVIDER_NAME = "Open AI compatible";

const getAutoFillName = (type: ProviderType): string => {
  if (type === ProviderType.OpenAiCompatible) return CUSTOM_PROVIDER_NAME;
  const label = getAiProviderLabel(type);
  return typeof label === "string" ? label : "";
};

const AddUpdateDialogComponent = ({
  variant,
  onClose,
  aiProviderTypesWithUrls,
  addAIProvider,
  updateAIProvider,
  providerData,
  initialModels,
  getAIConfig,
}: AddEditDialogProps) => {
  const { t } = useTranslation(["Common", "AISettings", "OAuth", "Webhooks"]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const providerOptions = useMemo(
    () => buildProviderOptions(aiProviderTypesWithUrls),
    [aiProviderTypesWithUrls],
  );

  const [selectedOption, setSelectedOption] = useState(
    getSelectedOptionByProviderType(providerOptions, providerData?.type),
  );
  const initialProviderType =
    providerData?.type ?? (providerOptions[0]?.key as ProviderType);
  const [providerTitle, setProviderTitle] = useState(
    providerData?.title ||
      (variant === "add" ? getAutoFillName(initialProviderType) : ""),
  );
  const [providerKey, setProviderKey] = useState("");
  const [providerUrl, setProviderUrl] = useState(
    providerData?.url ||
      getURLByProviderType(
        selectedOption.key as ProviderType,
        aiProviderTypesWithUrls,
      ),
  );
  const [isKeyInputHidden, setIsKeyInputHidden] = useState(
    variant === "update" && !providerData?.needReset,
  );
  const [isRequestRunning, setIsRequestRunning] = useState(false);

  const addButtonRef = useRef<HTMLDivElement>(null);

  const modelSelection = useModelSelection(
    selectedOption.key as ProviderType,
    providerKey,
    providerUrl,
    variant === "update" ? initialModels : undefined,
  );

  const valuesByProvider = useRef<
    Partial<
      Record<
        ProviderType,
        {
          title: string;
          url: string;
          key: string;
          models?: TModelSelectionState;
          availableModels?: TProviderModelInfo[];
        }
      >
    >
  >({});

  const initFormData = useRef({
    selectedOption,
    providerTitle,
    providerUrl,
    providerKey,
  });

  const initialModelStateRef = useRef<TModelSelectionState | null>(null);

  useEffect(() => {
    if (
      modelSelection.modelsLoaded &&
      initialModelStateRef.current === null
    ) {
      initialModelStateRef.current = modelSelection.getState();
    }
  }, [modelSelection.modelsLoaded, modelSelection.getState]);

  const isCustomProvider =
    (selectedOption.key as ProviderType) === ProviderType.OpenAiCompatible;
  const showModelsBlock = isCustomProvider
    ? modelSelection.modelsLoaded
    : modelSelection.modelsLoaded && modelSelection.availableModels.length > 0;

  const [canTogglePopup, setCanTogglePopup] = useState(false);

  useEffect(() => {
    if (!showModelsBlock) {
      setCanTogglePopup(false);
      return;
    }

    setCanTogglePopup(false);
    const timer = setTimeout(() => {
      setCanTogglePopup(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [showModelsBlock]);

  const requiredFieldsFilled =
    providerTitle.trim().length > 0 && providerUrl.trim().length > 0;
  const modelsReady =
    variant === "add"
      ? showModelsBlock && modelSelection.selectedModelIds.size > 0
      : showModelsBlock
        ? modelSelection.selectedModelIds.size > 0
        : true;
  const hasFormChanges = !equal(initFormData.current, {
    selectedOption,
    providerTitle,
    providerUrl,
    providerKey,
  });

  const currentModelState = modelSelection.getState();
  const hasModelChanges =
    showModelsBlock &&
    initialModelStateRef.current !== null &&
    !equal(initialModelStateRef.current, currentModelState);

  const hasChanges = hasFormChanges || hasModelChanges;

  const canSubmit = requiredFieldsFilled && modelsReady && hasChanges;

  const onSelectProvider = (option: TOption) => {
    const currentProviderType = selectedOption.key as ProviderType;
    const newProviderType = option.key as ProviderType;

    valuesByProvider.current[currentProviderType] = {
      title: providerTitle,
      url: providerUrl,
      key: providerKey,
      models: modelSelection.getState(),
      availableModels: [...modelSelection.availableModels],
    };

    setSelectedOption(option);

    const savedValues = valuesByProvider.current[newProviderType];
    if (savedValues?.title || savedValues?.url || savedValues?.key) {
      setProviderTitle(savedValues.title);
      setProviderUrl(savedValues.url);
      setProviderKey(savedValues.key);
    } else {
      const autoName = getAutoFillName(newProviderType);
      setProviderTitle(autoName);
      setProviderUrl(
        getURLByProviderType(newProviderType, aiProviderTypesWithUrls),
      );
      setProviderKey("");
    }

    modelSelection.loadModelsForProvider(
      savedValues?.models,
      savedValues?.availableModels,
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsRequestRunning(true);

    const buildAllSettings = (): TModelSettingsItem[] => {
      const state = modelSelection.getState();
      const selectedSet = new Set(state.selectedIds);

      return modelSelection.availableModels.map((model) => {
        const override = state.overrides[model.modelId];
        return {
          modelId: model.modelId,
          isEnabled: selectedSet.has(model.modelId),
          alias: override?.displayName ?? model.displayName,
          capabilities: override?.capabilities ?? model.capabilities,
        };
      });
    };

    const buildUpdateDelta = (
      allSettings: TModelSettingsItem[],
    ): TModelSettingsItem[] | undefined => {
      if (!initialModels) return undefined;

      const initialMap = new Map(initialModels.map((m) => [m.id, m]));

      const changed = allSettings.filter((item) => {
        const initial = initialMap.get(item.modelId);
        if (!initial) return true;
        return (
          item.isEnabled !== initial.isEnabled ||
          item.alias !== (initial.alias ?? initial.id) ||
          !equal(item.capabilities, initial.capabilities)
        );
      });

      return changed.length > 0 ? changed : undefined;
    };

    const buildAddDelta = (
      allSettings: TModelSettingsItem[],
    ): TModelSettingsItem[] | undefined => {
      const state = modelSelection.getState();
      const modelMap = new Map(
        modelSelection.availableModels.map((m) => [m.modelId, m]),
      );

      const changed = allSettings.filter((item) => {
        const model = modelMap.get(item.modelId);
        if (!model) return true;

        const isEnabledChanged = item.isEnabled !== !!model.isRecommended;
        const snapshot = state.snapshots[item.modelId];

        if (!snapshot) return isEnabledChanged;

        return (
          isEnabledChanged ||
          item.alias !== snapshot.displayName ||
          !equal(item.capabilities, snapshot.capabilities)
        );
      });

      return changed.length > 0 ? changed : undefined;
    };

    try {
      const allSettings = showModelsBlock ? buildAllSettings() : undefined;

      if (variant === "add") {
        const data: TCreateAiProvider = {
          key: providerKey,
          title: providerTitle,
          type: selectedOption.key as ProviderType,
          url: providerUrl,
          modelSettings: allSettings
            ? buildAddDelta(allSettings)
            : undefined,
        };

        await addAIProvider?.(data);
        toastr.success(
          t("AISettings:ProviderAddedSuccess", {
            aiProvider: t("Common:AIProvider"),
          }),
        );
      }

      if (variant === "update" && providerData?.id) {
        const data: TUpdateAiProvider = {};

        if (providerData.title !== providerTitle) {
          data.title = providerTitle;
        }

        if (providerData.url !== providerUrl) {
          data.url = providerUrl;
        }

        if (!isKeyInputHidden && providerKey.length > 0) {
          data.key = providerKey;
        }

        if (allSettings) {
          data.modelSettings = buildUpdateDelta(allSettings);
        }

        await updateAIProvider?.(providerData.id, data);
        toastr.success(
          t("AISettings:ProviderUpdatedSuccess", {
            aiProvider: t("Common:AIProvider"),
          }),
        );
      }

      modelCache.clear();
      getAIConfig?.();

      onClose();
    } catch (e) {
      toastr.error(e as TData);
    } finally {
      setIsRequestRunning(false);
    }
  };

  const handleSubmitClick = () => {
    if (canSubmit) submitButtonRef.current?.click();
  };

  const onResetKey = () => setIsKeyInputHidden(false);

  const filteredProviderTypes = providerOptions;

  useEffect(() => {
    if (providerData?.type) {
      valuesByProvider.current[providerData.type] = {
        title: providerData.title || "",
        url: providerData.url || "",
        key: "",
      };
    }
  }, [providerData]);

  const handleModelSettingsSave = useCallback(
    (
      modelId: string,
      displayName: string,
      capabilities: TModelCapabilities,
    ) => {
      modelSelection.updateModelSettings(modelId, displayName, capabilities);
    },
    [modelSelection],
  );

  const settingsModel = modelSelection.getModelForSettings();
  const { orderedModels, selectedModels } = modelSelection;

  return (
    <>
      <ModalDialog
        visible
        displayType={ModalDialogType.aside}
        onClose={onClose}
        withBodyScroll
      >
        <ModalDialog.Header>{t("Common:AIProvider")}</ModalDialog.Header>

        <ModalDialog.Body>
          <form
            className={styles.modalBody}
            onSubmit={onSubmit}
            data-testid={
              variant === "add" ? "add-provider-form" : "update-provider-form"
            }
          >
            <FieldContainer
              labelText={t("AISettings:Provider")}
              labelVisible
              isVertical
              removeMargin
            >
              <ComboBox
                options={filteredProviderTypes}
                selectedOption={selectedOption}
                onSelect={onSelectProvider}
                scaled
                scaledOptions
                isDisabled={variant === "update" || isRequestRunning}
                dataTestId="provider-type-combobox"
              />
            </FieldContainer>
            <FieldContainer
              labelText={t("Common:Label")}
              labelVisible
              isVertical
              removeMargin
              isRequired
            >
              <TextInput
                size={InputSize.base}
                type={InputType.text}
                value={providerTitle}
                onChange={(e) => setProviderTitle(e.target.value)}
                scale
                placeholder={t("AISettings:EnterLabel")}
                isDisabled={isRequestRunning}
                testId="provider-title-input"
              />
              <Text className={styles.fieldHint}>
                {t("AISettings:ProviderNameInputHint")}
              </Text>
            </FieldContainer>

            <FieldContainer
              labelText={t("AISettings:ProviderURL")}
              labelVisible
              isVertical
              removeMargin
              isRequired
            >
              <TextInput
                size={InputSize.base}
                type={InputType.text}
                value={providerUrl}
                onChange={(e) => setProviderUrl(e.target.value)}
                scale
                placeholder={t("OAuth:EnterURL")}
                isDisabled={
                  isRequestRunning ||
                  selectedOption.key !== ProviderType.OpenAiCompatible
                }
                testId="provider-url-input"
              />
              <Text className={styles.fieldHint}>
                {t("AISettings:ProviderURLInputHint")}
              </Text>
            </FieldContainer>
            <FieldContainer
              labelText={t("AISettings:ProviderKey")}
              labelVisible
              isVertical
              removeMargin
            >
              {isKeyInputHidden ? (
                <div className={styles.resetKeyBlock}>
                  <div className={styles.resetKeyHint}>
                    {t("AISettings:ResetProviderKeyDescription")}
                  </div>
                  <Link
                    type={LinkType.action}
                    fontWeight={600}
                    lineHeight="20px"
                    isHovered
                    onClick={onResetKey}
                    dataTestId="provider-reset-key-link"
                  >
                    {t("Webhooks:ResetKey")}
                  </Link>
                </div>
              ) : (
                <>
                  <PasswordInput
                    size={InputSize.base}
                    inputValue={providerKey}
                    onChange={(_, value) => setProviderKey(value ?? "")}
                    isFullWidth
                    isDisableTooltip
                    placeholder={t("AISettings:EnterKey")}
                    isDisabled={isRequestRunning}
                    isSimulateType
                    autoComplete="off"
                    hasError={providerData?.needReset}
                    testId="provider-key-input"
                  />
                  <Text
                    className={classNames(styles.fieldHint, {
                      [styles.fieldHintError]: providerData?.needReset,
                    })}
                  >
                    {t("AISettings:ProviderKeyInputHint", {
                      aiProvider: t("Common:AIProvider"),
                    })}
                  </Text>
                </>
              )}
            </FieldContainer>
            {showModelsBlock ? (
              <div style={{ position: "relative" }}>
                <SelectedModelsList
                  selectedModels={selectedModels}
                  onAddClick={() => {
                    if (canTogglePopup) modelSelection.togglePopup();
                  }}
                  hasError={modelSelection.hasError}
                  addButtonRef={addButtonRef}
                />
                {modelSelection.isPopupOpen ? (
                  <ModelSelectorPopup
                    anchor={addButtonRef}
                    recommended={orderedModels.recommended}
                    other={orderedModels.other}
                    selectedModelIds={modelSelection.selectedModelIds}
                    isCustomProvider={isCustomProvider}
                    isSettingsOpen={!!modelSelection.settingsModelId}
                    onToggle={modelSelection.toggleModel}
                    onEditModel={modelSelection.openSettings}
                    onClose={modelSelection.closePopup}
                  />
                ) : null}
              </div>
            ) : null}
            <button
              type="submit"
              ref={submitButtonRef}
              hidden
              aria-label="submit"
            />
          </form>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            primary
            size={ButtonSize.normal}
            label={t("Common:SaveButton")}
            scale
            onClick={handleSubmitClick}
            isLoading={isRequestRunning}
            isDisabled={!canSubmit}
            testId="provider-save-button"
          />
          <Button
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            scale
            onClick={onClose}
            isDisabled={isRequestRunning}
            testId="provider-cancel-button"
          />
        </ModalDialog.Footer>
      </ModalDialog>

      {settingsModel ? (
        <ModelSettingsPanel
          model={settingsModel}
          onSave={handleModelSettingsSave}
          onClose={modelSelection.closeSettings}
        />
      ) : null}
    </>
  );
};

export const AddUpdateProviderDialog = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    const { addAIProvider, updateAIProvider } = aiSettingsStore;
    const { getAIConfig } = settingsStore;

    return { addAIProvider, updateAIProvider, getAIConfig };
  },
)(observer(AddUpdateDialogComponent));
