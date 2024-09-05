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
import { isMobile } from "react-device-detect";

import { Base } from "../../themes";
import { mobile, tablet } from "../../utils";

import { Box } from "../box";
import { ModalDialogType } from "./ModalDialog.enums";

const StyledModal = styled.div<{ modalSwipeOffset?: number; blur?: number }>`
  #create-text-input::-webkit-search-decoration,
  #create-text-input::-webkit-search-cancel-button,
  #create-text-input::-webkit-search-results-button,
  #create-text-input::-webkit-search-results-decoration {
    appearance: none;
    -webkit-appearance: none;
  }

  pointer-events: none;
  &.modal-active {
    pointer-events: all;
  }
  .loader-wrapper {
    padding: 0 16px 16px;
  }
`;

const Dialog = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  margin: 0 auto;
  min-height: 100%;
`;

const Content = styled.div.attrs((props: { modalSwipeOffset?: number }) => ({
  style: {
    marginBottom:
      props.modalSwipeOffset && props.modalSwipeOffset < 0
        ? `${props.modalSwipeOffset * 1.1}px`
        : "0px",
  },
}))<{
  autoMaxHeight?: boolean;
  autoMaxWidth?: boolean;
  currentDisplayType?: ModalDialogType;
  modalSwipeOffset?: number;
  isLarge?: boolean;
  visible?: boolean;
  embedded?: boolean;
}>`
  box-sizing: border-box;
  position: relative;
  background-color: ${(props) => props.theme.modalDialog.backgroundColor};
  color: ${(props) => props.theme.modalDialog.textColor};
  padding: ${(props) =>
    props.currentDisplayType === "modal" ? "0" : "0 0 -16px"};
  ${(props) =>
    props.currentDisplayType === "modal"
      ? css<{
          autoMaxHeight?: boolean;
          autoMaxWidth?: boolean;
          isLarge?: boolean;
          visible?: boolean;
        }>`
          height: auto;
          max-height: ${props.autoMaxHeight
            ? "auto"
            : props.isLarge
              ? "400px"
              : "280px"};
          width: ${props.autoMaxWidth
            ? "auto"
            : props.isLarge
              ? "520px"
              : "400px"};

          border-radius: 6px;
          @media ${mobile} {
            transform: translateY(${props.visible ? "0" : "100%"});
            transition: transform 0.3s ease-in-out;
            position: absolute;
            bottom: 0;
            width: 100%;
            height: auto;
            border-radius: 6px 6px 0 0;
          }
        `
      : css<{ embedded?: boolean; visible?: boolean }>`
          width: 480px;
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          bottom: 0;

          inset-inline-end: 0;

          transform: translateX(
            ${props.visible
              ? "0"
              : props.theme.interfaceDirection === "rtl"
                ? "-100%"
                : "100%"}
          );

          transition: transform 0.3s ease-in-out;

          @media ${mobile} {
            transform: translateY(${props.visible ? "0" : "100%"});
            height: calc(100% - 64px);
            width: 100%;
            inset-inline: 0;
            top: ${props.embedded ? "0" : "auto"};
            top: auto;
            bottom: 0;
          }
        `}
`;

const StyledBody = styled(Box)<{
  currentDisplayType?: ModalDialogType;
  hasFooter?: boolean;
  isScrollLocked?: boolean;
  withBodyScroll?: boolean;
}>`
  position: relative;
  padding: 0 16px;
  padding-bottom: ${(props) =>
    props.currentDisplayType === "aside" || props.hasFooter ? "8px" : "16px"};

  white-space: pre-line;

  #modal-scroll > .scroll-wrapper > .scroller > .scroll-body {
    margin-inline-end: 0 !important;

    padding-inline-end: 16px !important;

    ${(props) =>
      props.isScrollLocked &&
      css`
        margin-inline-end: 0 !important;
        overflow: hidden !important;
      `}
  }

  ${(props) =>
    props.currentDisplayType === "aside" &&
    css<{ withBodyScroll?: boolean }>`
      margin-inline-end: ${props.withBodyScroll ? "-16px" : "0"};
      padding-bottom: 8px;
      height: 100%;
      min-height: auto;
    `}
`;

const StyledFooter = styled.div<{
  withFooterBorder?: boolean;
  isDoubleFooterLine?: boolean;
}>`
  display: flex;
  flex-direction: row;
  ${(props) =>
    props.withFooterBorder &&
    `border-top: 1px solid ${props.theme.modalDialog.headerBorderColor}`};
  padding: 16px;

  gap: 8px;
  @media ${tablet} {
    gap: 10px;
  }

  ${(props) =>
    props.isDoubleFooterLine &&
    css`
      flex-direction: column;
      div {
        display: flex;
        gap: 8px;
      }
    `}
`;

Dialog.defaultProps = { theme: Base };
Content.defaultProps = { theme: Base };

export { StyledModal, Content, Dialog, StyledBody, StyledFooter };
