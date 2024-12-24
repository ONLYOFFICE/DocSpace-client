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

import { Dialog } from "../../modal-dialog/ModalDialog.styled";
import { mobile } from "../../../utils";
import { ClippedPosition } from "./Guid.types";

const StyledDialog = styled(Dialog)<{
  isTourMode?: boolean;
  bottom?: number;
  left?: number;
}>`
  position: absolute;
  min-height: auto;
  top: ${(props) => props.bottom && `${props.bottom}px`};
  left: ${(props) => (props.left ? `${props.left}px` : "250px")};

  #modal-dialog {
    width: 430px;
    border-radius: 11px;

    .modal-header {
      margin-bottom: 0px !important;
      height: 54px;
      min-height: 54px;

      .header-component {
        font-size: 16px;
      }
    }

    .modal-header::after {
      border: none;
    }

    .modal-body {
      padding: 0px 18px 0px;
    }

    .modal-footer {
      justify-content: space-between;
      margin-bottom: 0px !important;
      padding: 12px 20px 20px;
    }
  }

  .welcome-tips-description {
    margin-bottom: 5px;
    font-size: 13px;
    line-height: 20px;
  }

  .circle-container {
    align-items: center;
    display: flex;
    gap: 10px;
  }

  .button-container {
    gap: 8px;
    display: flex;
  }
`;

const StyledGuidBackdrop = styled.div<{ zIndex?: number }>`
  display: block;
  height: 100%;
  min-height: fill-available;
  max-height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  // doesn't require mirroring for RTL
  left: 0;
  top: 0;

  background: ${(props) => props.theme.backdrop.backgroundColor};
  z-index: ${(props) => props.zIndex};

  @media ${mobile} {
    position: absolute;
  }

  transition: opacity 0.2s;
  opacity: 1;
`;

const StyledTipsCircle = styled.div<{ isSelected: boolean }>`
  width: 7px;
  height: 7px;
  background-color: ${(props) => props.theme.formFillingTips.circleColor};
  border-radius: 50%;
  ${(props) =>
    props.isSelected &&
    css`
      border: ${props.theme.formFillingTips.circleBorder};
      background-color: ${props.theme.formFillingTips.selectedColor};
    `}
`;

const StyledClipped = styled.div<{
  position: ClippedPosition;
  isBase: boolean;
}>`
  position: absolute;
  border-radius: 7px;
  ${(props) =>
    props.position &&
    css`
      left: ${`${props.position.left}px`};
      top: ${`${props.position.top}px`};
      width: ${props.position.width ? `${props.position.width}px` : "100%"};
      height: ${`${props.position.height}px`};
    `}
  backdrop-filter: ${(props) =>
    props.isBase ? "contrast(200%)" : "contrast(0.73)"};
`;

export { StyledDialog, StyledGuidBackdrop, StyledClipped, StyledTipsCircle };
