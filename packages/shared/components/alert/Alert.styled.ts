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

import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";

import { commonIconsStyles } from "../../utils";

const StyledAlertComponent = styled.div<{
  borderColor: string;
  needArrowIcon?: boolean;
  titleColor?: string;
}>`
  width: 100%;
  position: relative;
  border: ${(props) => `1px solid ${props.borderColor}`};
  border-radius: 6px;
  padding: 12px;
  ${(props) => !!props.onClick && "cursor:pointer"};
  display: grid;

  grid-template-columns: ${(props) =>
    props.needArrowIcon ? "1fr 16px" : "1fr"};

  .main-content {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    gap: 4px;
  }

  .alert-component_title {
    color: ${(props) => props.titleColor};
  }
  .alert-component_icons {
    margin: auto 0;
  }
`;

const StyledArrowRightIcon = styled(ArrowRightIcon)`
  margin: auto 0;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  path {
    fill: ${(props) => props.theme.alertComponent.iconColor};
  }
`;
const StyledCrossIcon = styled(CrossReactSvg)`
  position: absolute;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? css`
          left: 0px;
          margin-left: 8px;
        `
      : css`
          right: 0px;
          margin-right: 8px;
        `}
  margin-top: 8px;
  cursor: pointer;

  ${commonIconsStyles}
  path {
    fill: ${(props) => props.color};
  }
`;

export { StyledAlertComponent, StyledArrowRightIcon, StyledCrossIcon };
