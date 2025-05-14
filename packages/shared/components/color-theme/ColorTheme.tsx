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

"use client";

import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";

import { ColorThemeProps } from "./ColorTheme.types";
import { ThemeId } from "./ColorTheme.enums";

import IconButtonTheme from "./styled-components/iconButton";
import IconButtonMuteTheme from "./styled-components/iconButtonMute";
import IconButtonPinTheme from "./styled-components/iconButtonPin";
import IconButtonCustomFilterTheme from "./styled-components/iconButtonCustomFilter";
import IconWrapperTheme from "./styled-components/iconWrapper";
import IndicatorLoaderTheme from "./styled-components/indicatorLoader";
import InfoPanelToggleTheme from "./styled-components/infoPanelToggle";
import LinkTheme from "./styled-components/link";
import LinkForgotPasswordColorTheme from "./styled-components/linkForgotPassword";
import LoadingButton from "./styled-components/loadingButton";
import ProgressColorTheme from "./styled-components/progress";
import VersionBadgeTheme from "./styled-components/versionBadge";
import SubmenuTextTheme from "./styled-components/submenuText";
import StyledIndexWrapper from "./sub-components/StyledIndexWrapper";
import TextTheme from "./styled-components/text";

const ColorTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ColorThemeProps>
>(({ isVersion, themeId, hoverColor, ...props }, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  const getElement = () => {
    switch (themeId) {
      case ThemeId.IconButton: {
        return (
          <IconButtonTheme
            {...props}
            $currentColorScheme={currentColorScheme}
          />
        );
      }
      case ThemeId.IndexIconButton: {
        const onClickAction = (e: React.MouseEvent<Element>) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          if ("onClick" in props) props.onClick?.(e);
        };

        return (
          <StyledIndexWrapper
            $currentColorScheme={currentColorScheme}
            onClick={onClickAction}
          >
            <IconButtonTheme
              {...props}
              $currentColorScheme={currentColorScheme}
            />
          </StyledIndexWrapper>
        );
      }

      case ThemeId.IconButtonMute: {
        return (
          <IconButtonMuteTheme
            {...props}
            $currentColorScheme={currentColorScheme}
          />
        );
      }
      case ThemeId.IconButtonPin: {
        return (
          <IconButtonPinTheme
            {...props}
            $currentColorScheme={currentColorScheme}
          />
        );
      }

      case ThemeId.IconButtonCustomFilter: {
        return (
          <IconButtonCustomFilterTheme
            {...props}
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
            $currentColorScheme={currentColorScheme}
          />
        );
      }

      case ThemeId.SubmenuText: {
        return (
          <SubmenuTextTheme
            {...props}
            $currentColorScheme={currentColorScheme}
          />
        );
      }
      case ThemeId.Text: {
        return (
          <TextTheme {...props} $currentColorScheme={currentColorScheme} />
        );
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
