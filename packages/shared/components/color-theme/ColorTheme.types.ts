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

import { TColorScheme } from "../../themes";

import { IconButtonProps } from "../icon-button/IconButton.types";
import { LinkProps } from "../link/Link.types";
import { TextProps } from "../text/Text.types";
import type { TTheme } from "../../themes";
import { ThemeId } from "./ColorTheme.enums";

export interface DefaultColorThemeProps {
  hoverColor?: string;
  isVersion?: boolean;
  isSelected?: boolean;
}

export interface FilterBlockItemTagColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.FilterBlockItemTag;
  onClick?: (e: React.MouseEvent) => void;
  id?: string;
  name?: string;
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

export interface IconButtonCustomFilterColorTheme
  extends IconButtonProps,
    DefaultColorThemeProps {
  themeId: ThemeId.IconButtonCustomFilter;
}

export interface IconWrapperColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.IconWrapper;
  isRoot?: boolean;
}

export interface IndicatorFilterButtonColorTheme
  extends DefaultColorThemeProps {
  themeId: ThemeId.IndicatorFilterButton;
}

export interface IndexIconButton
  extends IconButtonProps,
    DefaultColorThemeProps {
  themeId: ThemeId.IndexIconButton;
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
  isRegisterContainerVisible?: boolean;
}

export interface LoadingButtonColorTheme extends DefaultColorThemeProps {
  themeId: ThemeId.LoadingButton;
  loaderColor?: React.CSSProperties["color"];
  onClick?: VoidFunction;
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
  tag?: string;
  truncate?: boolean;
  $currentColorScheme?: TColorScheme;
  onClick?: (e: React.MouseEvent<Element>) => void;
  $isUnderline?: boolean;
}

export interface SubmenuTextTheme extends TextProps, DefaultColorThemeProps {
  themeId: ThemeId.SubmenuText;
  isActive?: boolean;
}

export interface TextTheme extends TextProps, DefaultColorThemeProps {
  themeId: ThemeId.Text;
  isInline?: boolean;
}

export type ColorThemeProps =
  | IconButtonColorTheme
  | FilterBlockItemTagColorTheme
  | IconButtonMuteColorTheme
  | IconButtonPinColorTheme
  | IconButtonCustomFilterColorTheme
  | IconWrapperColorTheme
  | IndicatorFilterButtonColorTheme
  | IndicatorLoaderColorTheme
  | InfoPanelToggleColorTheme
  | LinkForgotPasswordColorTheme
  | LoadingButtonColorTheme
  | ProgressColorTheme
  | VersionBadgeTheme
  | LinkColorTheme
  | IndexIconButton
  | SubmenuTextTheme
  | TextTheme;
