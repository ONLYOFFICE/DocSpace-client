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

import styled from "styled-components";

import { Base } from "../../themes";
import { tablet } from "../../utils";

const StyledDragAndDrop = styled.div<{
  dragging?: boolean;
  isDragAccept?: boolean;
}>`
  /*-webkit-touch-callout: none;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;*/
  height: ${(props) => props.theme.dragAndDrop.height};
  border: ${(props) => props.theme.dragAndDrop.transparentBorder};

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-right: -2px;`
      : `margin-left: -2px;`}
  position: relative;

  @media ${tablet} {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 0;`
        : `margin-left: 0;`}
  }
  outline: none;
  background: ${(props) =>
    props.dragging
      ? props.isDragAccept
        ? props.theme.dragAndDrop.acceptBackground
        : props.theme.dragAndDrop.background
      : "none !important"};

  .droppable-hover {
    background: ${(props) => props.theme.dragAndDrop.acceptBackground};
  }
`;

StyledDragAndDrop.defaultProps = { theme: Base };

export default StyledDragAndDrop;
