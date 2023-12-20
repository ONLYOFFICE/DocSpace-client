import { TColorScheme, TTheme } from "../../themes";

import { IconButtonProps } from "../icon-button/IconButton.types";
import { LinkProps } from "../link/Link.types";

import { ThemeId } from "./ColorTheme.enums";

export interface DefaultColorThemeProps {
  hoverColor?: string;
  isVersion?: boolean;
  isSelected?: boolean;
}

export interface FilterBlockItemTagColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.FilterBlockItemTag;
}

export interface IconButtonColorTheme
  extends IconButtonProps,
    DefaultColorThemeProps {
  themeId: ThemeId.IconButton;
  shared?: boolean;
  locked?: boolean;
  isFavorite?: boolean;
  isEditing?: boolean;
}

export interface IconButtonMuteColorTheme
  extends IconButtonProps,
    DefaultColorThemeProps {
  themeId: ThemeId.IconButtonMute;
}

export interface IconButtonPinColorTheme
  extends IconButtonProps,
    DefaultColorThemeProps {
  themeId: ThemeId.IconButtonPin;
}

export interface IconWrapperColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.IconWrapper;
  isRoot?: boolean;
}

export interface IndicatorFilterButtonColorTheme
  extends DefaultColorThemeProps {
  themeId: ThemeId.IndicatorFilterButton;
}

export interface IndicatorLoaderColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.IndicatorLoader;
}

export interface InfoPanelToggleColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.InfoPanelToggle;
  isInfoPanelVisible?: boolean;
}

export interface LinkForgotPasswordColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.LinkForgotPassword;
}

export interface LoadingButtonColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.LoadingButton;
}

export interface ProgressColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.Progress;
  percent?: number;
  $currentColorScheme?: TColorScheme;
  theme: TTheme;
}

export interface VersionBadgeTheme extends DefaultColorThemeProps {
  themeId: ThemeId.VersionBadge;
  $isVersion?: boolean;
}

export interface LinkColorTheme extends LinkProps, DefaultColorThemeProps {
  themeId: ThemeId.Link;
  noHover?: boolean;
  $currentColorScheme?: TColorScheme;
  onClick?: (e: React.MouseEvent<Element>) => void;
}

export type ColorThemeProps =
  | IconButtonColorTheme
  | FilterBlockItemTagColorTheme
  | IconButtonMuteColorTheme
  | IconButtonPinColorTheme
  | IconWrapperColorTheme
  | IndicatorFilterButtonColorTheme
  | IndicatorLoaderColorTheme
  | InfoPanelToggleColorTheme
  | LinkForgotPasswordColorTheme
  | LoadingButtonColorTheme
  | ProgressColorTheme
  | VersionBadgeTheme
  | LinkColorTheme;
