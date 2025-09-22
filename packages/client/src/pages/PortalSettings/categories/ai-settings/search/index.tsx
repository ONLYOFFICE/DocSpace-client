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
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { WebSearchType } from "@docspace/shared/api/ai/enums";

import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "./Search.module.scss";

type TSearchProps = {
  webSearchInitied?: AISettingsStore["webSearchInitied"];
  webSearchConfig?: AISettingsStore["webSearchConfig"];
  restoreWebSearch?: AISettingsStore["restoreWebSearch"];
  updateWebSearch?: AISettingsStore["updateWebSearch"];
};

const SearchComponent = ({
  webSearchInitied,
  webSearchConfig,
  restoreWebSearch,
  updateWebSearch,
}: TSearchProps) => {
  const { t } = useTranslation(["Common", "AISettings", "Settings"]);

  const [value, setValue] = React.useState(webSearchConfig?.key ?? "");
  const [selectedOption, setSelectedOption] = React.useState<WebSearchType>(
    () => {
      if (webSearchConfig?.type === WebSearchType.Exa) return WebSearchType.Exa;

      return WebSearchType.None;
    },
  );
  const [saveRequestRunning, setSaveRequestRunning] = React.useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const onRestoreToDefault = async () => {
    setValue("");
    setSelectedOption(WebSearchType.None);

    restoreWebSearch?.();
  };

  const onSave = async () => {
    setSaveRequestRunning(true);
    await updateWebSearch?.(true, selectedOption, value);
    setSaveRequestRunning(false);
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
  }, [selectedOption]);

  React.useEffect(() => {
    setValue(webSearchConfig?.key ?? "");
    setSelectedOption(() => {
      if (webSearchConfig?.type === WebSearchType.Exa) return WebSearchType.Exa;

      return WebSearchType.None;
    });
  }, [webSearchConfig]);

  if (!webSearchInitied) return null;

  const isSaveDisabled =
    !value ||
    selectedOption === WebSearchType.None ||
    (webSearchConfig?.key === value &&
      selectedOption === webSearchConfig?.type);

  return (
    <div className={styles.aiProvider}>
      <Text className={styles.description}>
        {t("AISettings:SearchDescription", {
          productName: t("Common:ProductName"),
        })}
      </Text>
      <Link
        className={styles.learnMoreLink}
        target={LinkTarget.blank}
        type={LinkType.page}
        fontWeight={600}
        isHovered
        href=""
        color="accent"
      >
        {t("Common:LearnMore")}
      </Link>
      <div className={styles.searchForm}>
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
          />
        </FieldContainer>
        <FieldContainer
          labelVisible
          isVertical
          labelText={t("AISettings:APIKey")}
          removeMargin
        >
          <TextInput
            type={InputType.text}
            placeholder={t("AISettings:EnterKey")}
            value={value}
            onChange={onChange}
            scale
          />
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
          label={t("Settings:RestoreToDefault")}
          scale={false}
          onClick={onRestoreToDefault}
          isDisabled={
            webSearchConfig?.type === WebSearchType.None || saveRequestRunning
          }
        />
      </div>
    </div>
  );
};

export const Search = inject(({ aiSettingsStore }: TStore) => {
  return {
    webSearchInitied: aiSettingsStore.webSearchInitied,
    webSearchConfig: aiSettingsStore.webSearchConfig,
    restoreWebSearch: aiSettingsStore.restoreWebSearch,
    updateWebSearch: aiSettingsStore.updateWebSearch,
  };
})(observer(SearchComponent));
