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

import { mobile } from "../../../utils";

import { ModalDialogBackdropProps } from "../ModalDialog.types";

const backdropFilter = (props: { modalSwipeOffset?: number }) =>
  `${
    props.modalSwipeOffset
      ? `blur(${
          props.modalSwipeOffset < 0 && 8 - props.modalSwipeOffset * -0.0667
        }px)`
      : "blur(8px)"
  }`;

const StyledModalBackdrop = styled.div.attrs(
  (props: { modalSwipeOffset?: number; zIndex?: number }) => ({
    style: {
      backdropFilter: backdropFilter(props),
      WebkitBackdropFilter: backdropFilter(props),
      background: `${
        props.modalSwipeOffset
          ? `rgba(6, 22, 38, ${
              props.modalSwipeOffset < 0 &&
              0.2 - props.modalSwipeOffset * -0.002
            })`
          : `rgba(6, 22, 38, 0.2)`
      }`,
    },
  }),
)<{ modalSwipeOffset?: number; zIndex?: number }>`
  display: block;
  height: 100%;
  min-height: fill-available;
  max-height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;

  z-index: ${(props) => props.zIndex};

  @media ${mobile} {
    position: absolute;
  }

  transition: 0.2s;
  opacity: 0;
  &.modal-backdrop-active {
    opacity: 1;
  }
`;

const ModalBackdrop = ({
  className,
  zIndex,
  modalSwipeOffset,
  children,
}: ModalDialogBackdropProps) => {
  return (
    <StyledModalBackdrop
      zIndex={zIndex}
      className={className}
      modalSwipeOffset={modalSwipeOffset}
    >
      {children}
    </StyledModalBackdrop>
  );
};

export { ModalBackdrop };
