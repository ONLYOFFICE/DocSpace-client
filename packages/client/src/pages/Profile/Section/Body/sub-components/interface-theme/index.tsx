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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ThemeKeys } from "@docspace/shared/enums";
import { getSystemTheme } from "@docspace/ui-kit/utils/get-system-theme";
import { getEditorTheme } from "@docspace/shared/utils/common";
import { hideLoader, showLoader } from "@docspace/shared/utils/common";
import { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";

import ThemePreview from "./ThemePreview";
import styles from "./interface-theme.module.scss";

type InterfaceThemeProps = {
  theme?: ThemeKeys;
  changeTheme?: (theme: ThemeKeys) => Promise<void>;
  currentColorScheme?: TColorScheme;
  selectedThemeId?: string;
  isDesktopClient?: boolean;
};

const InterfaceTheme = (props: InterfaceThemeProps) => {
  const { t } = useTranslation(["Common", "Profile"]);

  const {
    theme,
    changeTheme,
    currentColorScheme,
    selectedThemeId,
    isDesktopClient,
  } = props;

  const [currentTheme, setCurrentTheme] = useState(theme);

  const themeChange = async (newTheme: ThemeKeys) => {
    showLoader();

    try {
      setCurrentTheme(newTheme);

      if (isDesktopClient && newTheme !== ThemeKeys.SystemStr) {
        const editorTheme = getEditorTheme(newTheme);
        window.AscDesktopEditor?.execCommand("portal:uitheme", editorTheme);
      }

      await changeTheme?.(newTheme);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      hideLoader();
    }
  };

  const onChangeTheme = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>,
  ) => {
    const target = e.currentTarget;

    themeChange(target.value as ThemeKeys);
  };

  const onChangeSystemTheme = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>,
  ) => {
    const isChecked = (e.currentTarget || e.target).checked;

    if (!isChecked) {
      themeChange(ThemeKeys.BaseStr);
    } else {
      themeChange(ThemeKeys.SystemStr);
    }
  };

  const isSystemTheme = currentTheme === ThemeKeys.SystemStr;
  const systemThemeValue = getSystemTheme();

  const systemThemeLabel = isDesktopClient
    ? t("Profile:DesktopTheme")
    : t("SystemTheme");
  const systemThemeDescriptionLabel = isDesktopClient
    ? t("Profile:DesktopThemeDescription")
    : t("SystemThemeDescription");

  return (
    <div
      className={styles.interfaceTheme}
      data-testid="profile-interface-theme"
    >
      <div>
        <Checkbox
          className={styles.systemThemeCheckbox}
          value={ThemeKeys.SystemStr}
          label={systemThemeLabel}
          isChecked={isSystemTheme}
          onChange={onChangeSystemTheme}
          dataTestId="system_theme_checkbox"
        />
        <Text as="div" className={styles.systemThemeDescription}>
          {systemThemeDescriptionLabel}
        </Text>
      </div>
      <div className={styles.themesContainer}>
        <ThemePreview
          label={t("LightTheme")}
          theme="Light"
          accentColor={currentColorScheme?.main?.accent ?? ""}
          themeId={selectedThemeId ?? ""}
          value={ThemeKeys.BaseStr}
          isChecked={
            currentTheme === ThemeKeys.BaseStr ||
            (isSystemTheme && systemThemeValue === ThemeKeys.BaseStr)
          }
          onChangeTheme={onChangeTheme}
          isDisabled={false}
        />
        <ThemePreview
          label={t("DarkTheme")}
          theme="Dark"
          accentColor={currentColorScheme?.main?.accent ?? ""}
          themeId={selectedThemeId ?? ""}
          value={ThemeKeys.DarkStr}
          isChecked={
            currentTheme === ThemeKeys.DarkStr ||
            (isSystemTheme && systemThemeValue === ThemeKeys.DarkStr)
          }
          onChangeTheme={onChangeTheme}
          isDisabled={false}
        />
      </div>

      <div className={styles.mobileThemesContainer}>
        <RadioButtonGroup
          orientation="vertical"
          name="interface-theme"
          options={[
            {
              value: ThemeKeys.BaseStr,
              label: t("LightTheme"),
              dataTestId: "light_theme_radio_button",
            },
            {
              value: ThemeKeys.DarkStr,
              label: t("DarkTheme"),
              dataTestId: "dark_theme_radio_button",
            },
          ]}
          onClick={onChangeTheme}
          selected={theme}
          spacing="12px"
          isDisabled={false}
        />
      </div>
    </div>
  );
};

export default inject(({ settingsStore, userStore }: TStore) => {
  const { changeTheme, user } = userStore;
  const { currentColorScheme, selectedThemeId, isDesktopClient } =
    settingsStore;

  return {
    changeTheme,
    theme: user?.theme || "System",
    currentColorScheme,
    selectedThemeId,
    isDesktopClient,
  };
})(observer(InterfaceTheme));
