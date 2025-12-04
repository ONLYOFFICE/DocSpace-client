/*
 * (c) Copyright Ascensio System SIA 2009-2025
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

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import { KnowledgeType } from "@docspace/shared/api/ai/enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { ComboBox, type TOption } from "@docspace/shared/components/combobox";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Text } from "@docspace/shared/components/text";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { toastr } from "@docspace/shared/components/toast";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { inject, observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";

import generalStyles from "../AISettings.module.scss";

import styles from "./Knowledge.module.scss";
import { ResetKnowledgeDialog } from "./dialogs/reset";

type TKnowledgeProps = {
  knowledgeInitied?: AISettingsStore["knowledgeInitied"];
  knowledgeConfig?: AISettingsStore["knowledgeConfig"];
  updateKnowledge?: AISettingsStore["updateKnowledge"];
  hasAIProviders?: AISettingsStore["hasAIProviders"];
  getAIConfig?: SettingsStore["getAIConfig"];
  aiConfig?: SettingsStore["aiConfig"];
  aiSettingsUrl?: string;
};

const FAKE_KEY_VALUE = "0000000000000000";

const KnowledgeComponent = ({
  knowledgeInitied,
  knowledgeConfig,
  updateKnowledge,
  hasAIProviders,
  getAIConfig,
  aiConfig,
  aiSettingsUrl,
}: TKnowledgeProps) => {
  const { t } = useTranslation(["Common", "AISettings", "AIRoom", "Settings"]);

  const [resetDialogVisible, setResetDialogVisible] =
    React.useState<boolean>(false);

  const [isKeyHidden, setIsKeyHidden] = React.useState(!!knowledgeConfig?.key);
  const [valuesByProvider, setValuesByProvider] = React.useState<
    Record<KnowledgeType, string>
  >(() => {
    const initial: Record<KnowledgeType, string> = {
      [KnowledgeType.OpenAi]: "",
      [KnowledgeType.OpenRouter]: "",
      [KnowledgeType.None]: "",
    };

    if (knowledgeConfig?.type && knowledgeConfig.key) {
      initial[knowledgeConfig.type] = FAKE_KEY_VALUE;
    }

    return initial;
  });
  const [selectedOption, setSelectedOption] = React.useState<KnowledgeType>(
    () => {
      if (knowledgeConfig?.type === KnowledgeType.OpenAi)
        return KnowledgeType.OpenAi;

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

      toastr.success(t("AISettings:KnowledgeEnabledSuccess"));
    } catch (e) {
      console.error(e);
      toastr.error(e as string);
    }

    getAIConfig?.();
    setSaveRequestRunning(false);
  };

  const items = React.useMemo(() => {
    return [
      {
        key: KnowledgeType.OpenAi,
        label: "OpenAI",
      },
      {
        key: KnowledgeType.OpenRouter,
        label: "OpenRouter",
      },
    ];
  }, []);

  const selectedItem = React.useMemo(() => {
    return items.find((item) => item.key === selectedOption);
  }, [items, selectedOption]);

  const currentValue = React.useMemo(() => {
    return valuesByProvider[selectedOption] || "";
  }, [valuesByProvider, selectedOption]);

  React.useEffect(() => {
    if (knowledgeConfig?.type) {
      setIsKeyHidden(true);
      if (knowledgeConfig.key) {
        setValuesByProvider((prev) => ({
          ...prev,
          [knowledgeConfig.type!]: FAKE_KEY_VALUE,
        }));
      }
    }

    setSelectedOption(() => {
      if (knowledgeConfig?.type === KnowledgeType.OpenAi)
        return KnowledgeType.OpenAi;

      if (knowledgeConfig?.type === KnowledgeType.OpenRouter)
        return KnowledgeType.OpenRouter;

      return KnowledgeType.None;
    });
  }, [knowledgeConfig]);

  if (!knowledgeInitied)
    return (
      <div className={generalStyles.search}>
        <RectangleSkeleton
          className={generalStyles.description}
          width="700px"
          height="36px"
        />
        <RectangleSkeleton
          className={generalStyles.learnMoreLink}
          width="100px"
          height="19px"
        />
        <div className={styles.knowledgeForm}>
          <div className={generalStyles.fieldContainer}>
            <RectangleSkeleton width="119px" height="20px" />
            <RectangleSkeleton width="340px" height="32px" />
          </div>
          <div className={generalStyles.fieldContainer}>
            <RectangleSkeleton width="48px" height="32px" />
            <RectangleSkeleton width="340px" height="32px" />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <RectangleSkeleton
            className={styles.addProviderButton}
            width="128px"
            height="32px"
          />
          <RectangleSkeleton
            className={styles.learnMoreLink}
            width="322px"
            height="32px"
          />
        </div>
      </div>
    );

  const isSaveDisabled =
    !currentValue || selectedOption === KnowledgeType.None || isKeyHidden;

  const tooltipId = "tooltip-web-search";

  return (
    <>
      <div
        className={generalStyles.search}
        data-tooltip-id={tooltipId}
        data-tooltip-content={
          !hasAIProviders
            ? t("AISettings:ToUseAddProvider", {
                value: t("AIRoom:Knowledge"),
              })
            : undefined
        }
      >
        <Text className={generalStyles.description}>
          {t("AISettings:KnowledgeSettingsDescription", {
            modelName: aiConfig?.embeddingModel || "text-embedding-3-small",
          })}
        </Text>
        {aiSettingsUrl ? (
          <Link
            className={generalStyles.learnMoreLink}
            target={LinkTarget.blank}
            type={LinkType.page}
            fontWeight={600}
            isHovered
            href={aiSettingsUrl}
            color="accent"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
        <div className={styles.knowledgeForm}>
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("AISettings:Provider")}
            removeMargin
          >
            <ComboBox
              options={items}
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
            />
          </FieldContainer>
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("AISettings:APIKey")}
            removeMargin
          >
            {isKeyHidden ? (
              <div className={styles.aiBanner}>
                <Text fontSize="12px" fontWeight={400} lineHeight="16px">
                  {t("AISettings:WebSearchKeyHiddenDescription")}
                </Text>
              </div>
            ) : (
              <>
                <PasswordInput
                  className={styles.passwordInput}
                  placeholder={t("AISettings:EnterKey")}
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
                />
                <Text className={styles.hiddenKeyDescription}>
                  {t("AISettings:KnowledgeKeyDescription")}
                </Text>
              </>
            )}
          </FieldContainer>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            primary
            size={ButtonSize.small}
            label={t("SaveButton")}
            scale={false}
            onClick={onSave}
            isLoading={saveRequestRunning}
            isDisabled={isSaveDisabled}
          />
          <Button
            size={ButtonSize.small}
            label={t("Settings:ResetSettings")}
            scale={false}
            onClick={onRestoreToDefault}
            isDisabled={
              !knowledgeConfig ||
              knowledgeConfig?.type === KnowledgeType.None ||
              saveRequestRunning
            }
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
      hasAIProviders: aiSettingsStore.hasAIProviders,
      getAIConfig: settingsStore.getAIConfig,
      aiConfig: settingsStore.aiConfig,
      aiSettingsUrl: settingsStore.aiSettingsUrl,
    };
  },
)(observer(KnowledgeComponent));
