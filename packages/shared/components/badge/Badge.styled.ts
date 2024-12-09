// (c) Copyright Ascensio System SIA 2009-2024
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

import styled, { css } from "styled-components";
import { TColorScheme, TTheme } from "../../themes";
import { injectDefaultTheme, tablet } from "../../utils";

import { Text } from "../text";
import { BadgeProps } from "./Badge.types";

const hoveredCss = css<{ backgroundColor?: string }>`
  cursor: pointer;
  border-color: ${(props) =>
    props.backgroundColor
      ? props.backgroundColor
      : props.theme.badge.backgroundColor};
`;

const highCss = css`
  cursor: default;
  padding: 3px 10px;
  border-radius: 6px;

  p {
    font-size: 13px;
    font-weight: 400;
  }
`;

const noBorderCss = css`
  border: none;
  border-radius: 6px;
`;

const StyledBadge = styled.div.attrs(injectDefaultTheme)<BadgeProps>`
  display: ${(props) => (props.label || props.label !== "0" ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  border: ${(props) => props.theme.badge.border};

  border-radius: ${(props) => props.borderRadius};
  width: fit-content;
  padding: ${(props) => (props.noHover ? "0" : props.theme.badge.padding)};

  height: ${(props) => props.height};

  line-height: ${(props) => props.lineHeight};

  overflow: ${(props) => props.theme.badge.overflow};
  flex-shrink: 0;

  border: ${(props) => props.border};

  ${(props) => props.type === "high" && noBorderCss}
  &:hover {
    ${(props) => !props.noHover && hoveredCss};
  }

  ${(props) => !props.noHover && props.isHovered && hoveredCss};

  @media ${tablet} {
    ${({ isVersionBadge }) => isVersionBadge && `width: auto;`}
  }
`;

const StyledInner = styled.div.attrs(injectDefaultTheme)<{
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
  padding?: string;
  compact?: boolean;
  type?: "high";
}>`
  background-color: ${(props) =>
    props.backgroundColor
      ? props.backgroundColor
      : props.theme.badge.backgroundColor};

  border-radius: ${(props) => props.borderRadius};

  max-width: ${(props) => props.maxWidth};

  padding: ${(props) => props.padding};
  text-align: center;
  user-select: none;

  line-height: ${(props) => (props.compact ? "0.8" : "1.5")};
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) => props.type === "high" && highCss}
`;

const StyledText = styled(Text).attrs(injectDefaultTheme)<{
  borderRadius?: string;
}>`
  color: ${(props) =>
    props.color ? props.color : props.theme.badge.color} !important;
  border-radius: ${(props) => props.borderRadius};
`;

const getDefaultStyles = ({
  $currentColorScheme,
  isVersionBadge,
  backgroundColor,
  color,
  theme,
  isPaidBadge,
  isMutedBadge,
  noHover,
}: {
  $currentColorScheme: TColorScheme;
  isVersionBadge?: boolean;
  backgroundColor?: string;
  color?: string;
  theme?: TTheme;
  isPaidBadge?: boolean;
  isMutedBadge?: boolean;
  noHover?: boolean;
}) =>
  $currentColorScheme &&
  !isVersionBadge &&
  css`
    ${StyledText} {
      color: ${color || isPaidBadge
        ? theme?.badge.color
        : $currentColorScheme?.text?.accent} !important;
    }

    ${StyledInner} {
      background-color: ${isMutedBadge
        ? theme?.badge.disableBackgroundColor
        : backgroundColor || $currentColorScheme?.main?.accent};

      &:hover {
        ${!noHover &&
        css`
          background-color: ${isMutedBadge
            ? theme?.badge.disableBackgroundColor
            : backgroundColor || $currentColorScheme?.main?.accent};
        `}
      }
    }

    &:hover {
      ${!noHover &&
      css`
        border-color: ${isMutedBadge
          ? theme?.badge.disableBackgroundColor
          : backgroundColor || $currentColorScheme?.main?.accent};
      `}
    }
  `;

const StyledBadgeTheme = styled(StyledBadge)(getDefaultStyles);

export { StyledBadge, StyledBadgeTheme, StyledInner, StyledText };
