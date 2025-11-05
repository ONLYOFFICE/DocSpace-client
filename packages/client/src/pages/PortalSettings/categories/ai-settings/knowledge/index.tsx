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

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { KnowledgeType, WebSearchType } from "@docspace/shared/api/ai/enums";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Tooltip } from "@docspace/shared/components/tooltip";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import generalStyles from "../AISettings.module.scss";

import styles from "./Knowledge.module.scss";

type TKnowledgeProps = {
  knowledgeInitied?: AISettingsStore["knowledgeInitied"];
  knowledgeConfig?: AISettingsStore["knowledgeConfig"];
  restoreKnowledge?: AISettingsStore["restoreKnowledge"];
  updateKnowledge?: AISettingsStore["updateKnowledge"];
  hasAIProviders?: AISettingsStore["hasAIProviders"];
  getAIConfig?: SettingsStore["getAIConfig"];
};

const FAKE_KEY_VALUE = "0000000000000000";

const KnowledgeComponent = ({
  knowledgeInitied,
  knowledgeConfig,
  restoreKnowledge,
  updateKnowledge,
  hasAIProviders,
  getAIConfig,
}: TKnowledgeProps) => {
  const { t } = useTranslation(["Common", "AISettings", "AIRoom", "Settings"]);

  const [isKeyHidden, setIsKeyHidden] = React.useState(!!knowledgeConfig?.key);
  const [value, setValue] = React.useState(
    knowledgeConfig?.key ? FAKE_KEY_VALUE : "",
  );
  const [selectedOption, setSelectedOption] = React.useState<KnowledgeType>(
    () => {
      if (knowledgeConfig?.type === KnowledgeType.OpenAi)
        return KnowledgeType.OpenAi;

      return KnowledgeType.None;
    },
  );
  const [saveRequestRunning, setSaveRequestRunning] = React.useState(false);

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, value?: string) => {
    setValue(value || "");
  };

  const onRestoreToDefault = async () => {
    setValue("");
    setSelectedOption(KnowledgeType.None);
    setIsKeyHidden(false);

    restoreKnowledge?.();
    getAIConfig?.();
  };

  const onSave = async () => {
    if (isKeyHidden) return;

    setSaveRequestRunning(true);
    await updateKnowledge?.(selectedOption, value);
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
  }, [selectedOption]);

  React.useEffect(() => {
    if (knowledgeConfig?.type) {
      setIsKeyHidden(true);
      setValue(FAKE_KEY_VALUE);
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
    !value || selectedOption === KnowledgeType.None || isKeyHidden;

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
          {t("AIRoom:KnowledgeDescription", {
            modelName: "text-embedding-3-small",
          })}
        </Text>
        <Link
          className={generalStyles.learnMoreLink}
          target={LinkTarget.blank}
          type={LinkType.page}
          fontWeight={600}
          isHovered
          href=""
          color="accent"
        >
          {t("Common:LearnMore")}
        </Link>
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
              isDisabled={!hasAIProviders}
            />
          </FieldContainer>
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("AISettings:APIKey")}
            removeMargin
          >
            <PasswordInput
              className={styles.passwordInput}
              placeholder={t("AISettings:EnterKey")}
              inputValue={value}
              onChange={onChange}
              scale
              isSimulateType
              isFullWidth
              isDisableTooltip
              isDisabled={isKeyHidden || selectedOption === KnowledgeType.None}
              autoComplete="off"
            />
            {isKeyHidden ? (
              <Text className={styles.hiddenKeyDescription}>
                {t("AISettings:WebSearchKeyHiddenDescription")}
              </Text>
            ) : null}
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
    </>
  );
};

export const Knowledge = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      knowledgeInitied: aiSettingsStore.knowledgeInitied,
      knowledgeConfig: aiSettingsStore.knowledgeConfig,
      restoreKnowledge: aiSettingsStore.restoreKnowledge,
      updateKnowledge: aiSettingsStore.updateKnowledge,
      hasAIProviders: aiSettingsStore.hasAIProviders,
      getAIConfig: settingsStore.getAIConfig,
    };
  },
)(observer(KnowledgeComponent));
