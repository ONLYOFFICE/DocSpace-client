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

import { KnowledgeType, ProviderType } from "@docspace/shared/api/ai/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { Text } from "@docspace/ui-kit/components/text";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { toastr } from "@docspace/ui-kit/components/toast";
import { observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  useAISettingsStore,
  useAgentsAIConfigStore,
} from "../../../_store";

import generalStyles from "../AISettings.module.scss";

import styles from "./Knowledge.module.scss";
import { ResetKnowledgeDialog } from "./dialogs/reset";
import { KnowledgeLoader } from "./KnowledgeLoader";

const FAKE_KEY_VALUE = "0000000000000000";

const KnowledgeComponent = () => {
  const aiSettingsStore = useAISettingsStore();
  const aiConfigStore = useAgentsAIConfigStore();
  const {
    knowledgeInitied,
    knowledgeConfig,
    updateKnowledge,
    hasAIProviders,
    aiProviders,
  } = aiSettingsStore;
  const { aiConfig, fetchAIConfig: getAIConfig } = aiConfigStore;
  // settingsStore.knowledgeSettingsUrl has no SDK equivalent — skip the
  // "Learn more" link in the SDK iframe context.
  const knowledgeSettingsUrl: string | undefined = undefined;

  const { t } = useTranslation(["Common"]);

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
      toastr.error(e instanceof Error ? e.message : String(e));
    }

    getAIConfig?.();
    setSaveRequestRunning(false);
  };

  const hasSystemProvider = aiProviders?.some(
    (p) => p.type === ProviderType.PortalAi,
  );
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
        // /portal-settings/payments/services is hosted by the parent frame;
        // SDK is iframe-bound. Omit the click handler.
        onExternalLinkClick: undefined,
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

export const Knowledge = observer(KnowledgeComponent);

export { KnowledgeLoader };
