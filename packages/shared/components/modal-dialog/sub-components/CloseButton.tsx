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

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";

import { IconButton } from "../../icon-button";
import { mobile } from "../../../utils";
import { Base } from "../../../themes";

import { ModalDialogCloseButtonProps } from "../ModalDialog.types";
import { ModalDialogType } from "../ModalDialog.enums";

const StyledCloseButtonWrapper = styled.div<{
  currentDisplayType: ModalDialogType;
}>`
  width: 17px;
  height: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  position: absolute;

  ${(props) =>
    props.currentDisplayType === "modal"
      ? css`
          top: 18px;

          inset-inline-end: -30px;

          @media ${mobile} {
            inset-inline-end: 10px;
            top: -27px;
          }
        `
      : css`
          top: 18px;
          inset-inline-start: -27px;
          @media ${mobile} {
            top: -27px;
            inset-inline: auto 10px;
          }
        `}

  .close-button, .close-button:hover {
    cursor: pointer;
    path {
      stroke: ${(props) => props.theme.modalDialog.closeButton.fillColor};
    }
  }
`;

StyledCloseButtonWrapper.defaultProps = { theme: Base };

const CloseButton = ({
  currentDisplayType,

  onClick,
}: ModalDialogCloseButtonProps) => {
  return (
    <StyledCloseButtonWrapper
      onClick={onClick}
      currentDisplayType={currentDisplayType}
      className="modal-close"
    >
      <IconButton
        size={17}
        className="close-button"
        iconName={CrossIconReactSvgUrl}
      />
    </StyledCloseButtonWrapper>
  );
};

export { CloseButton };
