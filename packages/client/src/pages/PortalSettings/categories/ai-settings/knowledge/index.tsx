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

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import {
  KnowledgeType,
  SYSTEM_AI_PROFILE_PROVIDER_TYPE,
} from "@docspace/shared/api/ai/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { Text } from "@docspace/ui-kit/components/text";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { inject, observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";

import generalStyles from "../AISettings.module.scss";

import styles from "./Knowledge.module.scss";
import { ResetKnowledgeDialog } from "./dialogs/reset";
import { KnowledgeLoader } from "./KnowledgeLoader";

type TKnowledgeProps = {
  knowledgeInitied?: AISettingsStore["knowledgeInitied"];
  knowledgeConfig?: AISettingsStore["knowledgeConfig"];
  updateKnowledge?: AISettingsStore["updateKnowledge"];
  getAIConfig?: SettingsStore["getAIConfig"];
  aiConfig?: SettingsStore["aiConfig"];
  knowledgeSettingsUrl?: SettingsStore["knowledgeSettingsUrl"];
};

const FAKE_KEY_VALUE = "0000000000000000";

const KnowledgeComponent = ({
  knowledgeInitied,
  knowledgeConfig,
  updateKnowledge,
  getAIConfig,
  aiConfig,
  knowledgeSettingsUrl,
}: TKnowledgeProps) => {
  const { t } = useTranslation(["Common"]);

  // Gate the Knowledge base on the AI chat profiles (the same signal the AI
  // settings tabs use), not the legacy /ai providers list. "Connected" means
  // at least one AI model profile is configured in the AI chat.
  const { useProfilesStore } = useStores();
  const hasAIProviders = useProfilesStore((s) => s.profiles.length > 0);
  const hasSystemProvider = useProfilesStore((s) =>
    s.profiles.some(
      (p) => p.providerType === SYSTEM_AI_PROFILE_PROVIDER_TYPE,
    ),
  );

  const [resetDialogVisible, setResetDialogVisible] =
    React.useState<boolean>(false);

  const [isKeyHidden, setIsKeyHidden] = React.useState(
    !!knowledgeConfig?.key && !knowledgeConfig?.needReset,
  );
  const [valuesByProvider, setValuesByProvider] = React.useState<
    Record<KnowledgeType, string>
  >(() => {
    const initial: Record<KnowledgeType, string> = {
      [KnowledgeType.OpenAi]: "",
      [KnowledgeType.OpenRouter]: "",
      [KnowledgeType.PortalAi]: "",
      [KnowledgeType.None]: "",
    };

    if (
      knowledgeConfig?.type &&
      knowledgeConfig.key &&
      !knowledgeConfig?.needReset
    ) {
      initial[knowledgeConfig.type] = FAKE_KEY_VALUE;
    }

    return initial;
  });
  const [selectedOption, setSelectedOption] = React.useState<KnowledgeType>(
    () => {
      if (knowledgeConfig?.type === KnowledgeType.OpenAi)
        return KnowledgeType.OpenAi;

      if (knowledgeConfig?.type === KnowledgeType.OpenRouter)
        return KnowledgeType.OpenRouter;

      if (knowledgeConfig?.type === KnowledgeType.PortalAi)
        return KnowledgeType.PortalAi;

      return KnowledgeType.None;
    },
  );
  const [saveRequestRunning, setSaveRequestRunning] = React.useState(false);

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, value?: string) => {
    setValuesByProvider((prev) => ({
      ...prev,
      [selectedOption]: value || "",
    }));
  };

  const onRestoreToDefault = async () => {
    setResetDialogVisible(true);
  };

  const refreshData = () => {
    setValuesByProvider({
      [KnowledgeType.OpenAi]: "",
      [KnowledgeType.OpenRouter]: "",
      [KnowledgeType.PortalAi]: "",
      [KnowledgeType.None]: "",
    });
    setSelectedOption(KnowledgeType.None);
    setIsKeyHidden(false);

    getAIConfig?.();
  };

  const closeDialog = () => {
    setResetDialogVisible(false);
  };

  const onSave = async () => {
    if (isKeyHidden) return;

    const currentValue = valuesByProvider[selectedOption] || "";

    setSaveRequestRunning(true);
    try {
      await updateKnowledge?.(selectedOption, currentValue);

      toastr.success(t("Common:KnowledgeEnabledSuccess"));
    } catch (e) {
      console.error(e);
      toastr.error(e as string);
    }

    getAIConfig?.();
    setSaveRequestRunning(false);
  };

  const isSystemProviderDisabled =
    hasSystemProvider && !aiConfig?.systemAiEnabled;

  const items = React.useMemo(() => {
    const options: TOption[] = [];

    if (hasSystemProvider) {
      options.push({
        key: KnowledgeType.PortalAi,
        label: isSystemProviderDisabled
          ? `ONLYOFFICE AI (${t("Common:ActivationRequired")})`
          : "ONLYOFFICE AI",
        disabled: isSystemProviderDisabled,
        withExternalLink: isSystemProviderDisabled,
        externalLinkPath: isSystemProviderDisabled
          ? "/portal-settings/payments/services"
          : undefined,
        onExternalLinkClick: isSystemProviderDisabled
          ? () =>
              window.DocSpace?.navigate("/portal-settings/payments/services")
          : undefined,
      });
    }

    options.push(
      {
        key: KnowledgeType.OpenAi,
        label: "OpenAI",
      },
      {
        key: KnowledgeType.OpenRouter,
        label: "OpenRouter",
      },
    );

    return options;
  }, [hasSystemProvider, isSystemProviderDisabled, t]);

  const selectedItem = React.useMemo(() => {
    return items.find((item) => item.key === selectedOption);
  }, [items, selectedOption]);

  const currentValue = React.useMemo(() => {
    return valuesByProvider[selectedOption] || "";
  }, [valuesByProvider, selectedOption]);

  React.useEffect(() => {
    if (knowledgeConfig?.type && !knowledgeConfig?.needReset) {
      setIsKeyHidden(true);
      if (knowledgeConfig.key) {
        setValuesByProvider((prev) => ({
          ...prev,
          [knowledgeConfig.type]: FAKE_KEY_VALUE,
        }));
      }
    }

    setSelectedOption(() => {
      if (knowledgeConfig?.type === KnowledgeType.OpenAi)
        return KnowledgeType.OpenAi;

      if (knowledgeConfig?.type === KnowledgeType.OpenRouter)
        return KnowledgeType.OpenRouter;

      if (knowledgeConfig?.type === KnowledgeType.PortalAi)
        return KnowledgeType.PortalAi;

      return KnowledgeType.None;
    });
  }, [knowledgeConfig]);

  if (!knowledgeInitied) return <KnowledgeLoader />;

  const isPortalAiSelected = selectedOption === KnowledgeType.PortalAi;
  const isSaveDisabled = isPortalAiSelected
    ? knowledgeConfig?.type === KnowledgeType.PortalAi
    : !currentValue || selectedOption === KnowledgeType.None || isKeyHidden;

  const tooltipId = "tooltip-web-search";

  return (
    <>
      <div
        className={generalStyles.search}
        data-tooltip-id={tooltipId}
        data-tooltip-content={
          !hasAIProviders
            ? t("Common:ToUseAddProvider", {
                value: t("Common:Knowledge"),
                aiProvider: t("Common:AIProvider"),
              })
            : undefined
        }
      >
        <Text className={generalStyles.description}>
          {t("Common:KnowledgeSettingsDescription", {
            modelName: aiConfig?.embeddingModel || "text-embedding-3-small",
            aiAgents: t("Common:AIAgents"),
          })}
        </Text>
        {knowledgeSettingsUrl ? (
          <Link
            className={generalStyles.learnMoreLink}
            target={LinkTarget.blank}
            type={LinkType.page}
            fontWeight={600}
            isHovered
            href={knowledgeSettingsUrl}
            color="accent"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
        <div className={styles.knowledgeForm} data-testid="knowledge-form">
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("Common:Provider")}
            removeMargin
          >
            <ComboBox
              options={items}
              showDisabledItems
              scaledOptions={hasSystemProvider}
              selectedOption={
                selectedItem ?? ({ label: t("Common:SelectAction") } as TOption)
              }
              scaled
              displayArrow
              onSelect={(option) =>
                setSelectedOption(option.key as KnowledgeType)
              }
              displaySelectedOption
              isDisabled={!hasAIProviders || isKeyHidden}
              dataTestId="knowledge-provider-combobox"
              dropDownTestId="knowledge-provider-dropdown"
            />
          </FieldContainer>
          {selectedOption !== KnowledgeType.PortalAi ? (
            <FieldContainer
              labelVisible
              isVertical
              labelText={t("Common:APIKey")}
              removeMargin
            >
              {isKeyHidden ? (
                <div
                  className={styles.aiBanner}
                  data-testid="knowledge-key-hidden-banner"
                >
                  <Text fontSize="12px" fontWeight={400} lineHeight="16px">
                    {t("Common:WebSearchKeyHiddenDescription")}
                  </Text>
                </div>
              ) : (
                <>
                  <PasswordInput
                    className={styles.passwordInput}
                    placeholder={t("Common:EnterKey")}
                    inputName="knowledge_key"
                    inputValue={currentValue}
                    onChange={onChange}
                    scale
                    isSimulateType
                    isFullWidth
                    isDisableTooltip
                    isDisabled={
                      isKeyHidden || selectedOption === KnowledgeType.None
                    }
                    autoComplete="off"
                    testId="knowledge-key-input"
                  />
                  <Text className={styles.hiddenKeyDescription}>
                    {t("Common:KnowledgeKeyDescription")}
                  </Text>
                </>
              )}
            </FieldContainer>
          ) : null}
        </div>
        <div className={styles.buttonContainer}>
          <Button
            primary
            size={ButtonSize.small}
            label={t("Common:SaveButton")}
            scale={false}
            onClick={onSave}
            isLoading={saveRequestRunning}
            isDisabled={isSaveDisabled}
            testId="knowledge-save-button"
          />
          <Button
            size={ButtonSize.small}
            label={t("Common:ResetSettings")}
            scale={false}
            onClick={onRestoreToDefault}
            isDisabled={
              !knowledgeConfig ||
              knowledgeConfig?.type === KnowledgeType.None ||
              saveRequestRunning ||
              knowledgeConfig.needReset
            }
            testId="knowledge-reset-button"
          />
        </div>
      </div>
      {!hasAIProviders ? (
        <Tooltip id={tooltipId} place="bottom" offset={10} float />
      ) : null}
      {resetDialogVisible ? (
        <ResetKnowledgeDialog onSuccess={refreshData} onClose={closeDialog} />
      ) : null}
    </>
  );
};

export const Knowledge = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      knowledgeInitied: aiSettingsStore.knowledgeInitied,
      knowledgeConfig: aiSettingsStore.knowledgeConfig,
      updateKnowledge: aiSettingsStore.updateKnowledge,
      getAIConfig: settingsStore.getAIConfig,
      aiConfig: settingsStore.aiConfig,
      knowledgeSettingsUrl: settingsStore.knowledgeSettingsUrl,
    };
  },
)(observer(KnowledgeComponent));

export { KnowledgeLoader };

