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
import { ComboBox, type TOption } from "@docspace/shared/components/combobox";
import { WebSearchType } from "@docspace/shared/api/ai/enums";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { toastr } from "@docspace/shared/components/toast";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import generalStyles from "../AISettings.module.scss";

import styles from "./Search.module.scss";
import { ResetWebSearchDialog } from "./dialogs/reset";
import { SearchLoader } from "./SearchLoader";

type TSearchProps = {
  webSearchInitied?: AISettingsStore["webSearchInitied"];
  webSearchConfig?: AISettingsStore["webSearchConfig"];
  restoreWebSearch?: AISettingsStore["restoreWebSearch"];
  updateWebSearch?: AISettingsStore["updateWebSearch"];
  hasAIProviders?: AISettingsStore["hasAIProviders"];
  webSearchSettingsUrl?: SettingsStore["webSearchSettingsUrl"];
  getAIConfig?: SettingsStore["getAIConfig"];
};

const FAKE_KEY_VALUE = "0000000000000000";

const SearchComponent = ({
  webSearchInitied,
  webSearchConfig,
  updateWebSearch,
  hasAIProviders,
  webSearchSettingsUrl,
  getAIConfig,
}: TSearchProps) => {
  const { t } = useTranslation(["Common", "AISettings", "Settings"]);

  const [resetDialogVisible, setResetDialogVisible] =
    React.useState<boolean>(false);

  const initEnabled = webSearchConfig?.enabled && !webSearchConfig?.needReset;

  const [isKeyHidden, setIsKeyHidden] = React.useState(initEnabled);
  const [value, setValue] = React.useState(initEnabled ? FAKE_KEY_VALUE : "");
  const [selectedOption, setSelectedOption] = React.useState<WebSearchType>(
    () => {
      if (webSearchConfig?.type === WebSearchType.Exa) return WebSearchType.Exa;

      return WebSearchType.None;
    },
  );
  const [saveRequestRunning, setSaveRequestRunning] = React.useState(false);

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, value?: string) => {
    setValue(value || "");
  };

  const refreshData = () => {
    setValue("");
    setSelectedOption(WebSearchType.None);
    setIsKeyHidden(false);
  };

  const closeDialog = () => {
    setResetDialogVisible(false);
  };

  const onRestoreToDefault = async () => {
    setResetDialogVisible(true);
  };

  const onSave = async () => {
    if (isKeyHidden) return;

    setSaveRequestRunning(true);
    try {
      await updateWebSearch?.(true, selectedOption, value);

      toastr.success(t("AISettings:WebSearchEnabledSuccess"));
    } catch (e) {
      console.error(e);
      toastr.error(e as string);
    }
    setSaveRequestRunning(false);
    getAIConfig?.();
  };

  const items = React.useMemo(() => {
    return [
      {
        key: WebSearchType.Exa,
        label: "Exa",
      },
    ];
  }, []);

  const selectedItem = React.useMemo(() => {
    return items.find((item) => item.key === selectedOption);
  }, [selectedOption, items]);

  React.useEffect(() => {
    if (webSearchConfig?.enabled && !webSearchConfig?.needReset) {
      setIsKeyHidden(true);
      setValue(FAKE_KEY_VALUE);
    }

    setSelectedOption(() => {
      if (webSearchConfig?.type === WebSearchType.Exa) return WebSearchType.Exa;

      return WebSearchType.None;
    });
  }, [webSearchConfig]);

  if (!webSearchInitied) return <SearchLoader />;

  const isSaveDisabled =
    !value || selectedOption === WebSearchType.None || isKeyHidden;

  const tooltipId = "tooltip-web-search";

  return (
    <>
      <div
        className={generalStyles.search}
        data-tooltip-id={tooltipId}
        data-tooltip-content={
          !hasAIProviders
            ? t("AISettings:ToUseAddProvider", {
                value: t("AISettings:Search"),
              })
            : undefined
        }
      >
        <Text className={generalStyles.description}>
          {t("AISettings:SearchDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        {webSearchSettingsUrl ? (
          <Link
            className={generalStyles.learnMoreLink}
            target={LinkTarget.blank}
            type={LinkType.page}
            fontWeight={600}
            isHovered
            href={webSearchSettingsUrl}
            color="accent"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
        <div className={styles.searchForm} data-testid="web-search-form">
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("AISettings:SearchEngine")}
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
                setSelectedOption(option.key as WebSearchType)
              }
              displaySelectedOption
              isDisabled={!hasAIProviders || isKeyHidden}
              dataTestId="web-search-engine-combobox"
              dropDownTestId="web-search-engine-dropdown"
            />
          </FieldContainer>
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("AISettings:APIKey")}
            removeMargin
          >
            {isKeyHidden ? (
              <div
                className={styles.aiBanner}
                data-testid="web-search-key-hidden-banner"
              >
                <Text fontSize="12px" fontWeight={400} lineHeight="16px">
                  {t("AISettings:WebSearchKeyHiddenDescription")}
                </Text>
              </div>
            ) : (
              <>
                <PasswordInput
                  className={styles.passwordInput}
                  placeholder={t("AISettings:EnterKey")}
                  inputValue={value}
                  onChange={onChange}
                  scale
                  isSimulateType
                  isFullWidth
                  isDisableTooltip
                  isDisabled={
                    isKeyHidden || selectedOption === WebSearchType.None
                  }
                  autoComplete="off"
                  testId="web-search-key-input"
                />
                <Text className={styles.hiddenKeyDescription}>
                  {t("AISettings:WebSearchKeyDescription")}
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
            testId="web-search-save-button"
          />
          <Button
            size={ButtonSize.small}
            label={t("Settings:ResetSettings")}
            scale={false}
            onClick={onRestoreToDefault}
            isDisabled={
              !webSearchConfig ||
              webSearchConfig?.type === WebSearchType.None ||
              saveRequestRunning ||
              webSearchConfig.needReset
            }
            testId="web-search-reset-button"
          />
        </div>
      </div>
      {!hasAIProviders ? (
        <Tooltip id={tooltipId} place="bottom" offset={10} float />
      ) : null}
      {resetDialogVisible ? (
        <ResetWebSearchDialog onSuccess={refreshData} onClose={closeDialog} />
      ) : null}
    </>
  );
};

export const Search = inject(({ aiSettingsStore, settingsStore }: TStore) => {
  return {
    webSearchInitied: aiSettingsStore.webSearchInitied,
    webSearchConfig: aiSettingsStore.webSearchConfig,
    updateWebSearch: aiSettingsStore.updateWebSearch,
    hasAIProviders: aiSettingsStore.hasAIProviders,
    webSearchSettingsUrl: settingsStore.webSearchSettingsUrl,
    getAIConfig: settingsStore.getAIConfig,
  };
})(observer(SearchComponent));

export { SearchLoader };
