// (c) Copyright Ascensio System SIA 2010-2024
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

import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";

import { Base } from "../../themes";
import { MOBILE_FOOTER_HEIGHT } from "../../constants";
import { tablet, mobile } from "../../utils";
import { StyledAsideProps } from "./Aside.types";

const Container = ({
  visible,
  scale,
  zIndex,
  contentPaddingBottom,
  forwardRef,
  ...props
}: StyledAsideProps) => <aside ref={forwardRef} {...props} />;

const StyledAside = styled(Container)`
  background-color: ${(props) => props.theme.aside.backgroundColor};
  height: ${(props) => props.theme.aside.height};

  position: fixed;
  top: ${(props) => props.theme.aside.top};

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          left: ${props.theme.aside.right};
          transform: translateX(
            ${props.visible ? "0" : props.scale ? "-100%" : "-480px"}
          );
        `
      : css`
          right: ${props.theme.aside.right};
          transform: translateX(
            ${props.visible ? "0" : props.scale ? "100%" : "480px"}
          );
        `}

  transition: ${(props) => props.theme.aside.transition};
  width: ${(props) => (props.scale ? "100%" : "480px")};
  z-index: ${(props) => props.zIndex};
  box-sizing: border-box;

  @media ${tablet} {
    max-width: calc(100% - 69px);

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            transform: translateX(
              ${props.visible ? "0" : props.scale ? "-100%" : "-480px"}
            );
          `
        : css`
            transform: translateX(
              ${props.visible ? "0" : props.scale ? "100%" : "480px"}
            );
          `}
  }

  @media ${mobile} {
    bottom: 0;
    top: unset;
    height: ${`calc(100% - ${MOBILE_FOOTER_HEIGHT})`};

    width: 100%;
    max-width: 100%;
    transform: translateY(${(props) => (props.visible ? "0" : "100%")});
    aside:not(:first-child) {
      height: 100%;
    }
  }

  &.modal-dialog-aside {
    padding-bottom: ${(props) =>
      props.contentPaddingBottom
        ? props.contentPaddingBottom
        : props.theme.aside.paddingBottom};

    .modal-dialog-aside-footer {
      position: fixed;
      bottom: ${(props) => props.theme.aside.bottom};
    }
  }
`;
StyledAside.defaultProps = { theme: Base };

const StyledControlContainer = styled.div`
  display: flex;

  width: 17px;
  height: 17px;
  position: absolute;

  cursor: pointer;

  align-items: center;
  justify-content: center;
  z-index: 450;

  top: 18px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl" ? `right: -27px;` : `left: -27px;`}

  @media ${tablet} {
    display: flex;

    top: 18px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `right: -27px;`
        : `left: -27px;`}
  }

  @media ${mobile} {
    display: flex;

    top: -27px;
    right: 10px;
    left: unset;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: unset;
            left: 10px;
          `
        : css`
            right: 10px;
            left: unset;
          `}
  }
`;

StyledControlContainer.defaultProps = { theme: Base };

const StyledCrossIcon = styled(CrossReactSvg)`
  width: 17px;
  height: 17px;
  z-index: 455;
  path {
    fill: ${(props) => props.theme.catalog.control.fill};
  }
`;

StyledCrossIcon.defaultProps = { theme: Base };

export { StyledAside, StyledControlContainer, StyledCrossIcon };
