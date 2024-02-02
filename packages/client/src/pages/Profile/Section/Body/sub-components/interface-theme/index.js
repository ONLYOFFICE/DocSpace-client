import React, { useState } from "react";
import styled, { css } from "styled-components";
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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px !important;
          `
        : css`
            margin-right: 8px !important;
          `}
  }

  .system-theme-description {
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    font-weight: 400;
    line-height: 16px;
    padding-left: 24px;
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
      padding-left: 30px;
    }
  }
`;

const InterfaceTheme = (props) => {
  const { t } = useTranslation(["Profile", "Common"]);
  const {
    theme,
    changeTheme,
    currentColorScheme,
    selectedThemeId,
    isDesktopClient,
  } = props;
  const [currentTheme, setCurrentTheme] = useState(theme);

  const themeChange = async (theme) => {
    showLoader();

    try {
      setCurrentTheme(theme);

      if (isDesktopClient) {
        const editorTheme = getEditorTheme(theme);
        window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
      }

      await changeTheme(theme);
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
            { value: ThemeKeys.BaseStr, label: t("LightTheme") },
            { value: ThemeKeys.DarkStr, label: t("DarkTheme") },
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
