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
