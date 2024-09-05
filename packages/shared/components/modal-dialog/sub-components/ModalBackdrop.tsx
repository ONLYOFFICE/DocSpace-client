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
import styled from "styled-components";
import { TTheme } from "@docspace/shared/themes";

import { mobile } from "../../../utils";
import { ModalDialogBackdropProps } from "../ModalDialog.types";

const backdropBackground = (props: {
  theme: TTheme;
  modalSwipeOffset?: number;
}) => {
  const { r, g, b, a } = props.theme.modalDialog.backdrop.backgroundRGBA;
  const swipeOffset = props.modalSwipeOffset;

  if (!swipeOffset) return `rgba(${r}, ${g}, ${b}, ${a})`;
  return `rgba(${r}, ${g}, ${b}, ${a + swipeOffset * (a / 120)})`;
};

const StyledModalBackdrop = styled.div<{ zIndex?: number }>`
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
  opacity: 0;
  &.modal-backdrop-active {
    opacity: 1;
  }
`;

const ModalBackdrop = ({
  className,
  zIndex,
  children,
}: ModalDialogBackdropProps) => {
  return (
    <StyledModalBackdrop zIndex={zIndex} className={className}>
      {children}
    </StyledModalBackdrop>
  );
};

export { ModalBackdrop };
