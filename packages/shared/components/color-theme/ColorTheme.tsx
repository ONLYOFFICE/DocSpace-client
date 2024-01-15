import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";

import { ColorThemeProps } from "./ColorTheme.types";
import { ThemeId } from "./ColorTheme.enums";

import FilterBlockItemTagTheme from "./styled-components/filterBlockItemTag";
import IconButtonTheme from "./styled-components/iconButton";
import IconButtonMuteTheme from "./styled-components/iconButtonMute";
import IconButtonPinTheme from "./styled-components/iconButtonPin";
import IconWrapperTheme from "./styled-components/iconWrapper";
import IndicatorFilterButtonTheme from "./styled-components/indicatorFilterButton";
import IndicatorLoaderTheme from "./styled-components/indicatorLoader";
import InfoPanelToggleTheme from "./styled-components/infoPanelToggle";
import LinkTheme from "./styled-components/link";
import LinkForgotPasswordColorTheme from "./styled-components/linkForgotPassword";
import LoadingButton from "./styled-components/loadingButton";
import ProgressColorTheme from "./styled-components/progress";
import VersionBadgeTheme from "./styled-components/versionBadge";
import SubmenuTextTheme from "./styled-components/submenuText";

const ColorTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ColorThemeProps>
>(({ isVersion, themeId, hoverColor, ...props }, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  const getElement = () => {
    switch (themeId) {
      case ThemeId.FilterBlockItemTag: {
        return (
          <FilterBlockItemTagTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.IconButton: {
        return (
          <IconButtonTheme
            {...props}
            themeId={themeId}
            $currentColorScheme={currentColorScheme}
          />
        );
      }

      case ThemeId.IconButtonMute: {
        return (
          <IconButtonMuteTheme
            {...props}
            themeId={themeId}
            $currentColorScheme={currentColorScheme}
          />
        );
      }
      case ThemeId.IconButtonPin: {
        return (
          <IconButtonPinTheme
            {...props}
            themeId={themeId}
            $currentColorScheme={currentColorScheme}
          />
        );
      }

      case ThemeId.IconWrapper: {
        return (
          <IconWrapperTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.IndicatorFilterButton: {
        return (
          <IndicatorFilterButtonTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.IndicatorLoader: {
        return (
          <IndicatorLoaderTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.InfoPanelToggle: {
        return (
          <InfoPanelToggleTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.LinkForgotPassword: {
        return (
          <LinkForgotPasswordColorTheme
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.LoadingButton: {
        return (
          <LoadingButton
            {...props}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.Progress: {
        return (
          <ProgressColorTheme
            {...props}
            themeId={ThemeId.Progress}
            $currentColorScheme={currentColorScheme}
            ref={ref}
          />
        );
      }

      case ThemeId.VersionBadge: {
        return (
          <VersionBadgeTheme
            {...props}
            $currentColorScheme={currentColorScheme}
          />
        );
      }

      case ThemeId.Link: {
        const onClickAction = (e: React.MouseEvent<Element>) => {
          // @ts-expect-error Its not error, because its link onClick, not IconButton
          if ("onClick" in props) props.onClick?.(e);
        };

        return (
          <LinkTheme
            {...props}
            onClick={onClickAction}
            themeId={ThemeId.Link}
            $currentColorScheme={currentColorScheme}
          />
        );
      }

      case ThemeId.SubmenuText: {
        return <SubmenuTextTheme {...props} />;
      }

      default:
        return null;
    }
  };

  const element = getElement();

  return element;
});

ColorTheme.displayName = "ColorTheme";

export { ColorTheme };
