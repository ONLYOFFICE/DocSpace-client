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
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { toastr } from "@docspace/shared/components/toast";

import { ThemeKeys } from "@docspace/shared/enums";

import { mobile, getSystemTheme, getEditorTheme } from "@docspace/shared/utils";
import { showLoader } from "@docspace/shared/utils/common";

import ThemePreview from "./theme-preview";

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 660px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .system-theme-checkbox {
    display: inline-flex;
  }

  .checkbox {
    height: 20px;
    margin-inline-end: 8px !important;
  }

  .system-theme-description {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    padding-inline-start: 24px;
    max-width: 295px;
    color: ${(props) => props.theme.profile.themePreview.descriptionColor};
  }

  .themes-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;

    @media ${mobile} {
      display: none;
    }
  }

  .mobile-themes-container {
    display: none;

    @media ${mobile} {
      display: flex;
      padding-inline-start: 30px;
    }
  }
`;

const InterfaceTheme = (props) => {
  const { t } = useTranslation(["Common"]);
  const {
    theme,
    changeTheme,
    currentColorScheme,
    selectedThemeId,
    isDesktopClient,
  } = props;
  const [currentTheme, setCurrentTheme] = useState(theme);

  const themeChange = async (newTheme) => {
    showLoader();

    try {
      setCurrentTheme(newTheme);

      if (isDesktopClient && newTheme !== ThemeKeys.SystemStr) {
        const editorTheme = getEditorTheme(newTheme);
        window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
      }

      await changeTheme(newTheme);
    } catch (error) {
      console.error(error);
      toastr.error(error);
    }
  };

  const onChangeTheme = (e) => {
    const target = e.currentTarget;
    if (target.isChecked) return;
    themeChange(target.value);
  };

  const onChangeSystemTheme = (e) => {
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
    ? t("DesktopTheme")
    : t("SystemTheme");
  const systemThemeDescriptionLabel = isDesktopClient
    ? t("DesktopThemeDescription")
    : t("SystemThemeDescription");

  return (
    <StyledWrapper>
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
          className="light-theme"
          label={t("LightTheme")}
          theme="Light"
          accentColor={currentColorScheme.main?.accent}
          themeId={selectedThemeId}
          value={ThemeKeys.BaseStr}
          isChecked={
            currentTheme === ThemeKeys.BaseStr ||
            (isSystemTheme && systemThemeValue === ThemeKeys.BaseStr)
          }
          onChangeTheme={onChangeTheme}
        />
        <ThemePreview
          className="dark-theme"
          label={t("DarkTheme")}
          theme="Dark"
          accentColor={currentColorScheme.main?.accent}
          themeId={selectedThemeId}
          value={ThemeKeys.DarkStr}
          isChecked={
            currentTheme === ThemeKeys.DarkStr ||
            (isSystemTheme && systemThemeValue === ThemeKeys.DarkStr)
          }
          onChangeTheme={onChangeTheme}
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
          isDisabled={isSystemTheme}
        />
      </div>
    </StyledWrapper>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const { changeTheme, user } = userStore;
  const { currentColorScheme, selectedThemeId, isDesktopClient } =
    settingsStore;

  return {
    changeTheme,
    theme: user.theme || "System",
    currentColorScheme,
    selectedThemeId,
    isDesktopClient,
  };
})(observer(InterfaceTheme));
