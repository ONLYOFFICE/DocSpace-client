import React, { forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  CatalogItemTheme,
  CalendarTheme,
  DateItemTheme,
  RoundButtonTheme,
  SubmenuTextTheme,
  SubmenuItemLabelTheme,
  TabsContainerTheme,
  IconButtonTheme,
  IconButtonPinTheme,
  IndicatorFilterButtonTheme,
  FilterBlockItemTagTheme,
  IconWrapperTheme,
  VersionBadgeTheme,
  InputBlockTheme,
  TextInputTheme,
  LinkForgotPasswordTheme,
  LoadingButtonTheme,
  InfoPanelToggleTheme,
  LinkTheme,
  SliderTheme,
  IndicatorLoaderTheme,
  ProgressTheme,
  MobileProgressBarTheme,
  IconButtonMuteTheme,
} from "./styled";

import { ThemeType } from "./constants";

const ColorTheme = forwardRef(
  ({ isVersion, themeId, hoverColor, ...props }, ref) => {
    const { currentColorScheme } = useContext(ThemeContext);

    switch (themeId) {
      case ThemeType.VersionBadge: {
        return (
          <VersionBadgeTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            $isVersion={isVersion}
            ref={ref}
          />
        );
      }

      case ThemeType.LinkForgotPassword: {
        return (
          <LinkForgotPasswordTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            // @ts-expect-error TS(2769): No overload matches this call.
            ref={ref}
          />
        );
      }
      case ThemeType.LoadingButton: {
        return (
          <LoadingButtonTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            // @ts-expect-error TS(2769): No overload matches this call.
            ref={ref}
          />
        );
      }

      case ThemeType.Progress: {
        return (
          <ProgressTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            // @ts-expect-error TS(2769): No overload matches this call.
            ref={ref}
          />
        );
      }
    }
  }
);
export default ColorTheme;
