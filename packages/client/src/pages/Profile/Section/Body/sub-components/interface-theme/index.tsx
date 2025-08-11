// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { toastr } from "@docspace/shared/components/toast";
import { ThemeKeys } from "@docspace/shared/enums";
import { getSystemTheme, getEditorTheme } from "@docspace/shared/utils";
import { hideLoader, showLoader } from "@docspace/shared/utils/common";
import { TColorScheme } from "@docspace/shared/themes";

import ThemePreview from "./ThemePreview";
import { StyledWrapperInterfaceTheme } from "./InterfaceTheme.styled";

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
        window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
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
    : t("Profile:SystemTheme");
  const systemThemeDescriptionLabel = isDesktopClient
    ? t("Profile:DesktopThemeDescription")
    : t("Profile:SystemThemeDescription");

  return (
    <StyledWrapperInterfaceTheme>
      <div>
        <Checkbox
          className="system-theme-checkbox"
          value={ThemeKeys.SystemStr}
          label={systemThemeLabel}
          isChecked={isSystemTheme}
          onChange={onChangeSystemTheme}
          dataTestId="system_theme_checkbox"
        />
        <Text as="div" className="system-theme-description">
          {systemThemeDescriptionLabel}
        </Text>
      </div>
      <div className="themes-container">
        <ThemePreview
          label={t("LightTheme")}
          theme="Light"
          accentColor={currentColorScheme!.main?.accent}
          themeId={selectedThemeId!}
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
          accentColor={currentColorScheme!.main?.accent}
          themeId={selectedThemeId!}
          value={ThemeKeys.DarkStr}
          isChecked={
            currentTheme === ThemeKeys.DarkStr ||
            (isSystemTheme && systemThemeValue === ThemeKeys.DarkStr)
          }
          onChangeTheme={onChangeTheme}
          isDisabled={false}
        />
      </div>

      <div className="mobile-themes-container">
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
    </StyledWrapperInterfaceTheme>
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
