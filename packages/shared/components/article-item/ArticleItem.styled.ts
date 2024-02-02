import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";

import { Base, TColorScheme } from "../../themes";
import { tablet } from "../../utils";

import { Text } from "../text";

const badgeWithoutText = css`
  position: absolute;

  top: ${(props) => props.theme.catalogItem.badgeWithoutText.position};
  right: ${(props) => props.theme.catalogItem.badgeWithoutText.position};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      left: ${props.theme.catalogItem.badgeWithoutText.position};
      right: auto;
    `}
  border-radius: 1000px;

  background-color: ${(props) =>
    props.theme.catalogItem.badgeWithoutText.backgroundColor};

  width: ${(props) => props.theme.catalogItem.badgeWithoutText.size} !important;
  min-width: ${(props) =>
    props.theme.catalogItem.badgeWithoutText.size} !important;
  height: ${(props) =>
    props.theme.catalogItem.badgeWithoutText.size} !important;
  min-height: ${(props) =>
    props.theme.catalogItem.badgeWithoutText.size} !important;

  margin: 0 !important;
`;

const StyledArticleItemHeaderContainer = styled.div<{
  isFirstHeader?: boolean;
  showText?: boolean;
}>`
  width: 100%;

  height: 24px;

  padding: 7px 12px 4px;

  box-sizing: border-box;

  margin-top: ${(props) => (props.isFirstHeader ? "0" : "8px")};

  .catalog-item__header-text {
    font-style: normal;
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("11px")};
    line-height: 14px;
    color: #a3a9ae;
  }

  @media ${tablet} {
    padding: ${(props) => (props.showText ? "0px 9px 12px" : "4px 12px 19px")};

    margin-top: ${(props) => (props.isFirstHeader ? "0" : "16px")};

    ${(props) =>
      !props.showText &&
      css`
        display: flex;
        justify-content: center;

        .catalog-item__header-text {
          width: 20px;

          line-height: 1px;
          height: 1px;

          background: #d0d5da;
        }
      `}
  }
`;

const StyledArticleItemBadgeWrapper = styled.div<{ showText?: boolean }>`
  z-index: 3;

  margin-left: ${(props) => props.theme.catalogItem.badgeWrapper.marginLeft};
  margin-right: ${(props) => props.theme.catalogItem.badgeWrapper.marginRight};

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: ${props.theme.catalogItem.badgeWrapper.marginLeft};
      margin-left: ${props.theme.catalogItem.badgeWrapper.marginRight};
    `}

  div {
    display: flex;
    align-items: center;
  }

  @media ${tablet} {
    display: flex;
    align-items: center;
    justify-content: center;

    width: ${(props) => props.theme.catalogItem.badgeWrapper.tablet.width};
    min-width: ${(props) => props.theme.catalogItem.badgeWrapper.tablet.width};
    height: ${(props) => props.theme.catalogItem.badgeWrapper.tablet.height};
    margin-right: ${(props) =>
      props.theme.catalogItem.badgeWrapper.tablet.marginRight};
  }

  ${(props) => !props.showText && badgeWithoutText}

  .catalog-item__badge {
    display: flex;
    align-items: center;
    justify-content: center;

    //width: ${(props) => props.theme.catalogItem.badgeWrapper.size};
    min-width: ${(props) => props.theme.catalogItem.badgeWrapper.size};
    height: ${(props) => props.theme.catalogItem.badgeWrapper.size};
    min-height: ${(props) => props.theme.catalogItem.badgeWrapper.size};

    div {
      display: flex;
      align-items: center;
      justify-content: center;

      height: ${(props) => props.theme.catalogItem.badgeWrapper.size};

      p {
        display: flex;
        align-items: center;
        justify-content: center;

        line-height: 16px;
      }
    }
  }
`;

StyledArticleItemBadgeWrapper.defaultProps = { theme: Base };

const StyledArticleItemInitialText = styled(Text)`
  position: absolute;
  top: 2px;
  left: 0;
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      left: auto;
      right: 0;
    `}
  text-align: center;
  width: ${(props) => props.theme.catalogItem.initialText.width};
  line-height: ${(props) => props.theme.catalogItem.initialText.lineHeight};
  max-height: ${(props) => props.theme.catalogItem.initialText.lineHeight};
  color: ${(props) => props.theme.catalogItem.initialText.color};
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(
      props.theme.catalogItem.initialText.fontSize,
    )};
  font-weight: ${(props) => props.theme.catalogItem.initialText.fontWeight};
  pointer-events: none;

  @media ${tablet} {
    width: ${(props) => props.theme.catalogItem.initialText.tablet.width};
    line-height: ${(props) =>
      props.theme.catalogItem.initialText.tablet.lineHeight};
    font-size: ${(props) =>
      props.theme.getCorrectFontSize(
        props.theme.catalogItem.initialText.tablet.fontSize,
      )};
  }
`;

StyledArticleItemInitialText.defaultProps = { theme: Base };

const StyledArticleItemText = styled(Text)<{ isActive?: boolean }>`
  width: ${(props) => props.theme.catalogItem.text.width};

  margin-left: ${(props) => props.theme.catalogItem.text.marginLeft};

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-left: 0;
      margin-right: ${props.theme.catalogItem.text.marginLeft};
    `}

  line-height: ${(props) => props.theme.catalogItem.text.lineHeight};

  z-index: 1;

  align-items: center;

  pointer-events: none;

  color: ${(props) =>
    props.isActive
      ? props.theme.catalogItem.text.isActiveColor
      : props.theme.catalogItem.text.color};

  font-size: ${(props) =>
    props.theme.getCorrectFontSize(props.theme.catalogItem.text.fontSize)};
  font-weight: ${(props) => props.theme.catalogItem.text.fontWeight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${tablet} {
    margin-left: ${(props) => props.theme.catalogItem.text.tablet.marginLeft};
    line-height: ${(props) => props.theme.catalogItem.text.tablet.lineHeight};
    font-size: ${(props) =>
      props.theme.getCorrectFontSize(
        props.theme.catalogItem.text.tablet.fontSize,
      )};
    font-weight: ${(props) => props.theme.catalogItem.text.tablet.fontWeight};
  }
`;

StyledArticleItemText.defaultProps = { theme: Base };

const StyledArticleItemImg = styled.div<{ isActive?: boolean }>`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1;

  pointer-events: none;

  height: ${(props) => props.theme.catalogItem.img.svg.height};

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    width: ${(props) => props.theme.catalogItem.img.svg.width};
    height: ${(props) => props.theme.catalogItem.img.svg.height};
    path,
    circle {
      fill: ${(props) =>
        props.isActive
          ? props.theme.catalogItem.img.svg.isActiveFill
          : props.theme.catalogItem.img.svg.fill};
    }
  }

  @media ${tablet} {
    height: ${(props) => props.theme.catalogItem.img.svg.tablet.height};
    svg {
      width: ${(props) => props.theme.catalogItem.img.svg.tablet.width};
      height: ${(props) => props.theme.catalogItem.img.svg.tablet.height};
    }
  }
`;

StyledArticleItemImg.defaultProps = { theme: Base };

const draggingSiblingCss = css`
  background: ${(props) => props.theme.dragAndDrop.background} !important;

  &:hover {
    background: ${(props) =>
      props.theme.dragAndDrop.acceptBackground} !important;
  }
`;

const StyledArticleItemSibling = styled.div<{
  isActive?: boolean;
  isDragActive?: boolean;
  isDragging?: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      left: auto;
      right: 0;
    `}

  width: 100%;
  height: 100%;

  border-radius: 3px;

  min-height: ${(props) => props.theme.catalogItem.container.height};
  max-height: ${(props) => props.theme.catalogItem.container.height};

  background-color: ${(props) =>
    props.isActive && props.theme.catalogItem.sibling.active.background};

  ${!isMobile &&
  css`
    &:hover {
      background-color: ${(props) =>
        props.theme.catalogItem.sibling.hover.background};
    }
  `}

  @media ${tablet} {
    min-height: ${(props) => props.theme.catalogItem.container.tablet.height};
    max-height: ${(props) => props.theme.catalogItem.container.tablet.height};
  }

  ${(props) => props.isDragging && draggingSiblingCss}

  ${(props) =>
    props.isDragActive &&
    css`
      background: ${props.theme.dragAndDrop.acceptBackground} !important;
    `}
`;

StyledArticleItemSibling.defaultProps = { theme: Base };

const StyledArticleItemContainer = styled.div<{
  showText?: boolean;
  isEndOfBlock?: boolean;
}>`
  display: flex;
  justify-content: ${(props) => (props.showText ? "space-between" : "center")};
  align-items: center;

  min-width: ${(props) => props.theme.catalogItem.container.width};
  min-height: ${(props) => props.theme.catalogItem.container.height};
  max-height: ${(props) => props.theme.catalogItem.container.height};

  position: relative;
  box-sizing: border-box;

  padding: ${(props) =>
    props.showText && props.theme.catalogItem.container.padding};
  margin-bottom: ${(props) =>
    props.isEndOfBlock && props.theme.catalogItem.container.marginBottom};

  cursor: pointer;

  @media ${tablet} {
    min-height: ${(props) => props.theme.catalogItem.container.tablet.height};
    max-height: ${(props) => props.theme.catalogItem.container.tablet.height};

    padding: ${(props) =>
      props.showText && props.theme.catalogItem.container.tablet.padding};
    margin-bottom: ${(props) =>
      props.isEndOfBlock &&
      props.theme.catalogItem.container.tablet.marginBottom};
  }

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .catalog-item__icon {
    display: none;
  }

  .catalog-item__icon:target {
    display: flex;
  }

  .catalog-item__icon {
    svg {
      path {
        fill: ${(props) => props.theme.catalogItem.trashIconFill};
      }
    }
  }

  :hover {
    .catalog-item__icon {
      display: flex;
    }
  }
`;

StyledArticleItemContainer.defaultProps = { theme: Base };

const StyledArticleItemTheme = styled(StyledArticleItemContainer)<{
  isActive?: boolean;
  $currentColorScheme?: TColorScheme;
}>`
  ${StyledArticleItemText} {
    color: ${(props) =>
      props.isActive &&
      props.theme.isBase &&
      props.$currentColorScheme?.main?.accent};

    &:hover {
      color: ${(props) =>
        props.isActive &&
        props.theme.isBase &&
        props.$currentColorScheme?.main?.accent};
    }
  }

  ${StyledArticleItemImg} {
    svg {
      path {
        fill: ${(props) =>
          props.isActive &&
          props.theme.isBase &&
          props.$currentColorScheme?.main?.accent} !important;
      }
      circle {
        fill: ${(props) =>
          props.isActive &&
          props.theme.isBase &&
          props.$currentColorScheme?.main?.accent} !important;
      }
    }

    &:hover {
      svg {
        path {
          fill: ${(props) =>
            props.isActive &&
            props.theme.isBase &&
            props.$currentColorScheme?.main?.accent} !important;
        }
      }
    }
  }
`;

StyledArticleItemTheme.defaultProps = { theme: Base };

export {
  StyledArticleItemContainer,
  StyledArticleItemImg,
  StyledArticleItemInitialText,
  StyledArticleItemText,
  StyledArticleItemSibling,
  StyledArticleItemBadgeWrapper,
  StyledArticleItemHeaderContainer,
  StyledArticleItemTheme,
};
