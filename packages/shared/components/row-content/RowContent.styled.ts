import styled, { css } from "styled-components";
import { Base } from "../../themes";
import { tablet, size } from "../../utils";

const truncateCss = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const commonCss = css`
  margin: ${(props) => props.theme.rowContent.margin};
  font-family: "Open Sans";
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(props.theme.rowContent.fontSize)};
  font-style: ${(props) => props.theme.rowContent.fontStyle};
  font-weight: ${(props) => props.theme.rowContent.fontWeight};
`;

const containerTabletStyle = css`
  display: block;
  height: ${(props) => props.theme.rowContent.height};
`;

const mainWrapperTabletStyle = css`
  min-width: ${(props) => props.theme.rowContent.mainWrapper.minWidth};

  margin-top: ${(props) => props.theme.rowContent.mainWrapper.marginTop};
  width: ${(props) => props.theme.rowContent.mainWrapper.width};

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: ${theme.rowContent.mainWrapper.marginRight};`
      : `margin-right: ${theme.rowContent.mainWrapper.marginRight};`}
`;

const mainContainerTabletStyle = css`
  ${truncateCss};
  max-width: ${(props) => props.theme.rowContent.maxWidth};
`;

const sideInfoTabletStyle = css<{ color?: string }>`
  display: block;
  min-width: ${(props) => props.theme.rowContent.sideInfo.minWidth};
  margin: ${(props) => props.theme.rowContent.sideInfo.margin};
  ${commonCss};
  color: ${(props) => props.color && props.color};
  ${truncateCss};
`;

const StyledRowContent = styled.div<{
  disableSideInfo?: boolean;
  widthProp?: number;
  isMobile: boolean;
}>`
  width: 100%;
  display: inline-flex;

  ${(props) =>
    (!props.disableSideInfo &&
      props.widthProp &&
      props.widthProp <= size.desktop) ||
    props.isMobile
      ? `${containerTabletStyle}`
      : `
    @media ${tablet} {
      ${containerTabletStyle}
    }
  `}
`;
StyledRowContent.defaultProps = { theme: Base };

const MainContainerWrapper = styled.div<{
  disableSideInfo?: boolean;
  widthProp?: number;
  isMobile: boolean;
  mainContainerWidth?: string;
}>`
  ${commonCss};

  display: flex;
  align-self: center;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `
      margin-right: 0;
      margin-left: auto;
      `
      : `
      margin-left: 0;
      margin-right: auto;
      `}

  width: ${(props) =>
    props.mainContainerWidth ? props.mainContainerWidth : "140px"};
  min-width: 140px;

  ${(props) =>
    (!props.disableSideInfo &&
      props.widthProp &&
      props.widthProp <= size.desktop) ||
    props.isMobile
      ? css`
          ${mainWrapperTabletStyle}
        `
      : `
  `}
  @media ${tablet} {
    ${mainWrapperTabletStyle}
  }
`;

MainContainerWrapper.defaultProps = { theme: Base };

const MainContainer = styled.div<{
  widthProp?: number;
  isMobile: boolean;
  mainContainerWidth?: string;
}>`
  height: 20px;

  max-width: 100%;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: 8px;`
      : `margin-right: 8px;`}

  ${(props) =>
    (props.widthProp && props.widthProp <= size.desktop) || props.isMobile
      ? `${mainContainerTabletStyle}`
      : `
    @media ${tablet} {
      ${mainContainerTabletStyle}
    }
  `}
`;
MainContainer.defaultProps = { theme: Base };

const MainIcons = styled.div`
  height: ${(props) => props.theme.rowContent.icons.height};
  align-self: center;
  white-space: nowrap;
`;
MainIcons.defaultProps = { theme: Base };

const SideContainerWrapper = styled.div<{
  disableSideInfo?: boolean;
  widthProp?: number;
  isMobile: boolean;
  mainContainerWidth?: string;
  containerWidth?: string;
  containerMinWidth?: string;
}>`
  ${commonCss};

  ${(props) =>
    (props.widthProp && props.widthProp <= size.desktop) || props.isMobile
      ? `${truncateCss}`
      : `
    @media ${tablet} {
      ${truncateCss}
    }
  `}

  align-self: center;
  align-items: center;

  > a {
    vertical-align: middle;
  }

  width: ${(props) => (props.containerWidth ? props.containerWidth : "40px")};
  min-width: ${(props) =>
    props.containerMinWidth ? props.containerMinWidth : "40px"};
  color: ${(props) => props.color && props.color};

  ${(props) =>
    (!props.disableSideInfo &&
      props.widthProp &&
      props.widthProp <= size.desktop) ||
    props.isMobile
      ? `display: none;`
      : `
    @media ${tablet} {
      display: none;
    }
  `}
`;
SideContainerWrapper.defaultProps = { theme: Base };

const TabletSideInfo = styled.div<{
  color?: string;
  widthProp?: number;
  isMobile?: boolean;
}>`
  display: none;
  ${(props) => (props.color ? `color: ${props.color};` : null)}
  ${(props) =>
    (props.widthProp && props.widthProp <= size.desktop) || props.isMobile
      ? `${sideInfoTabletStyle}`
      : `
    @media ${tablet} {
      ${sideInfoTabletStyle}
    }
  `}
`;
TabletSideInfo.defaultProps = { theme: Base };

export {
  TabletSideInfo,
  SideContainerWrapper,
  MainContainer,
  MainIcons,
  MainContainerWrapper,
  StyledRowContent,
};
