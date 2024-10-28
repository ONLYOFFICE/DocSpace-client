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

import styled, { keyframes } from "styled-components";

import { injectDefaultTheme } from "../../utils";

const BounceAnimation = keyframes`
0% { margin-bottom: 0; display: none; }
50% { margin-bottom: 1px;  }
100% { margin-bottom: 0; display: none; }
`;

const DotWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;

const Dot = styled.div.attrs(injectDefaultTheme)<{
  color?: string;
  size: number;
  delay: string;
}>`
  background-color: ${(props) =>
    props.color ? props.color : props.theme.loader.color};
  border-radius: ${(props) => props.theme.loader.borderRadius};

  width: ${(props) => props.size / 9}px;
  height: ${(props) => props.size / 9}px;
  margin-inline-end: ${(props) => props.theme.loader.marginRight};
  /* Animation */
  animation: ${BounceAnimation} 0.5s linear infinite;
  animation-delay: ${(props) => props.delay};
`;

const LoadingWrapper = styled.div<{ color?: string; size: string }>`
  display: flex;
  align-items: baseline;

  color: ${(props) => props.color};

  font-size: ${(props) => props.size};
`;

const LoadingLabel = styled.span.attrs(injectDefaultTheme)`
  margin-inline-end: ${(props) => props.theme.loader.marginRight};
`;

const StyledOval = styled.svg.attrs(injectDefaultTheme)<{ size?: string }>`
  width: ${(props) => (props.size ? props.size : props.theme.loader.size)};

  height: ${(props) => (props.size ? props.size : props.theme.loader.size)};
  stroke: ${(props) => (props.color ? props.color : props.theme.loader.color)};
`;

const StyledDualRing = styled.svg.attrs(injectDefaultTheme)<{
  size?: string;
  color?: string;
}>`
  width: ${(props) => (props.size ? props.size : props.theme.loader.size)};

  height: ${(props) => (props.size ? props.size : props.theme.loader.size)};
  stroke: ${(props) => (props.color ? props.color : props.theme.loader.color)};
`;

const StyledTrack = styled.svg.attrs(injectDefaultTheme)<{
  size?: string;
  color?: string;
  primary?: boolean;
}>`
  width: ${(props) => (props.size ? props.size : "20px")};

  height: ${(props) => (props.size ? props.size : "20px")};

  color: ${({ color, primary, theme }) =>
    color ||
    (primary ? theme.button.loader.primary : theme.button.loader.base)};
`;

export {
  LoadingLabel,
  LoadingWrapper,
  DotWrapper,
  Dot,
  StyledOval,
  StyledDualRing,
  StyledTrack,
};
