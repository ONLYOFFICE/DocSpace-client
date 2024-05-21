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

import { Base } from "../../themes";

const StyledOuter = styled.div<{ displayIconBorder?: boolean }>`
  display: inline-block;
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  ${(props) =>
    props.displayIconBorder &&
    css`
      border: ${props.theme.comboBox.button.border};
      width: 32px;
      height: 32px;
      box-sizing: border-box;
      border-radius: 3px;

      svg {
        padding: 6px 7px;
      }
      :hover {
        border-color: ${props.theme.comboBox.button.hoverBorderColor};
      }
    `}
`;
StyledOuter.defaultProps = { theme: Base };

const StyledContent = styled.div`
  box-sizing: border-box;
  position: relative;
  width: ${(props) => props.theme.contextMenuButton.content.width};
  background-color: ${(props) =>
    props.theme.contextMenuButton.content.backgroundColor};
  padding: ${(props) => props.theme.contextMenuButton.content.padding};

  .header {
    max-width: ${(props) =>
      props.theme.contextMenuButton.headerContent.maxWidth};
    margin: ${(props) => props.theme.contextMenuButton.headerContent.margin};
    line-height: ${(props) =>
      props.theme.contextMenuButton.headerContent.lineHeight};
    font-weight: ${(props) =>
      props.theme.contextMenuButton.headerContent.fontWeight} !important;
  }
`;
StyledContent.defaultProps = { theme: Base };

const StyledHeaderContent = styled.div`
  display: flex;
  align-items: center;
  border-bottom: ${(props) =>
    props.theme.contextMenuButton.headerContent.borderBottom};
`;
StyledHeaderContent.defaultProps = { theme: Base };

const StyledBodyContent = styled.div`
  position: relative;
  padding: ${(props) => props.theme.contextMenuButton.bodyContent.padding};
  display: flex;
  flex-direction: column;

  .context-menu-button_link {
    margin-top: 17px;
  }

  .context-menu-button_link-header {
    text-transform: uppercase;
  }

  .context-menu-button_link-header:not(:first-child) {
    margin-top: 50px;
  }
`;
StyledBodyContent.defaultProps = { theme: Base };

export { StyledBodyContent, StyledHeaderContent, StyledContent, StyledOuter };
