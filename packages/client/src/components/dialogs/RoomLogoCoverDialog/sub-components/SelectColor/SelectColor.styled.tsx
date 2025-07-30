// (c) Copyright Ascensio System SIA 2009-2025
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

import { tablet } from "@docspace/shared/utils";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { globalColors } from "@docspace/shared/themes";
import type { ColorItemProps } from "./SelecColor.types";

const StyledModalDialog = styled(ModalDialog)`
  .modal-close {
    display: none;
  }

  #modal-dialog {
    max-height: none;
  }

  .hex-color-picker {
    padding-bottom: 0 !important;
    width: auto !important;

    .react-colorful__saturation {
      border-bottom: none;

      .react-colorful__interactive {
        width: calc(100% - 16px) !important;
        height: calc(100% - 16px);
      }
    }

    .react-colorful__hue {
      .react-colorful__interactive {
        width: auto;
      }
    }
  }
`;

const StyledColorItem = styled.div<ColorItemProps>`
  width: 30px;
  height: 30px;
  margin-top: 8px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.color};

  @media ${tablet} {
    width: 40px;
    height: 40px;
  }

  ${(props) =>
    props.isSelected &&
    css`
      background-color: ${props.theme.logoCover.selectColor.backgroundColor};
    `}

  &:hover {
    cursor: pointer;
  }
`;

const SelectedColorItem = styled.div`
  width: 30px;
  height: 30px;
  box-sizing: border-box;
  margin-top: 8px;
  border-radius: 50%;
  border: ${(props) => `solid 2px ${props.color}`};
  display: flex;
  align-items: center;
  justify-content: center;

  @media ${tablet} {
    width: 40px;
    height: 40px;
  }

  .circle {
    width: 20px;
    height: 20px;
    background-color: ${(props) => props.color};
    border-radius: 50%;

    @media ${tablet} {
      width: 28px;
      height: 28px;
    }
  }
`;

const CustomSelectedColor = styled.div<ColorItemProps>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  box-sizing: border-box;

  ${(props) =>
    props.color === globalColors.white &&
    css`
      border: 2px solid ${globalColors.black};
    `}

  @media ${tablet} {
    width: 40px;
    height: 40px;
  }

  .color-picker-circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${(props) => props.color};

    @media ${tablet} {
      width: 30px;
      height: 30px;
    }
  }

  ${(props) =>
    props.isSelected &&
    css`
      width: 30px;
      height: 30px;

      border: ${props.color === globalColors.white
        ? `solid 2px ${globalColors.black}`
        : `solid 2px ${props.color}`};
      @media ${tablet} {
        width: 40px;
        height: 40px;
      }
    `}

  ${(props) =>
    !props.isSelected &&
    css`
      background-color: ${props.color};
    `}

  svg {
    path {
      fill: ${(props) =>
        props.color === globalColors.white
          ? globalColors.black
          : globalColors.white} !important;
    }
    &:hover {
      path {
        fill: ${(props) =>
          props.color === globalColors.white
            ? globalColors.black
            : globalColors.white} !important;
      }
    }
  }
`;

export {
  StyledModalDialog,
  StyledColorItem,
  SelectedColorItem,
  CustomSelectedColor,
};
