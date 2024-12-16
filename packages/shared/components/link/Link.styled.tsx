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

import React from "react";
import styled, { css } from "styled-components";

import { Text } from "../text";
import { globalColors } from "../../themes";
import { injectDefaultTheme, NoUserSelect } from "../../utils";
import { LinkProps } from "./Link.types";

const colorCss = css<LinkProps>`
  color: ${(props) => (props.color ? props.color : props.theme.link.color)};
`;

const hoveredCss = css<LinkProps>`
  ${colorCss};
  text-decoration: ${(props) =>
    props.type === "page"
      ? props.theme.link.hover.page.textDecoration
      : props.theme.link.hover.textDecoration};
`;

const PureText = ({
  type,
  color,
  ...props
}: LinkProps & { tag?: string; truncate?: boolean }) => <Text {...props} />;

const StyledText = styled(PureText).attrs(injectDefaultTheme)`
  text-decoration: ${(props) => props.theme.link.textDecoration};
  text-underline-offset: 2px;

  ${(props) =>
    props.enableUserSelect
      ? css`
          user-select: text;
        `
      : NoUserSelect}

  cursor: ${(props) => props.theme.link.cursor};
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  opacity: ${(props) => props.isSemitransparent && props.theme.link.opacity};
  line-height: ${(props) =>
    props.lineHeight ? props.lineHeight : props.theme.link.lineHeight};

  ${colorCss};

  &:hover {
    ${(props) => !props.noHover && hoveredCss};
  }

  ${(props) => !props.noHover && props.isHovered && hoveredCss}

  ${(props) =>
    props.isTextOverflow &&
    css`
      display: ${props.theme.link.display};
      max-width: 100%;
    `}
`;

export default StyledText;
