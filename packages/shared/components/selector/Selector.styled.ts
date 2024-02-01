import styled, { css } from "styled-components";

import ArrowRightSvg from "PUBLIC_DIR/images/arrow.right.react.svg";

import { Base } from "../../themes";

import { ComboBox } from "../combobox";
import { Text } from "../text";

const StyledSelector = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  overflow: hidden;
`;

const StyledHeader = styled.div`
  width: calc(100% - 32px);
  min-height: 53px;
  height: 53px;
  max-height: 53px;

  padding: 0 16px;

  border-bottom: ${(props) => props.theme.selector.border};

  display: flex;
  align-items: center;

  .arrow-button {
    cursor: pointer;
    margin-right: 12px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-left: 12px;
        margin-right: 0px;
        transform: scaleX(-1);
      `}
  }

  .heading-text {
    font-weight: 700;
    font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    line-height: 28px;
  }
`;

StyledHeader.defaultProps = { theme: Base };

const StyledBody = styled.div<{
  footerVisible: boolean;
  withHeader?: boolean;
  footerHeight: number;
  headerHeight: number;
}>`
  width: 100%;

  height: ${(props) =>
    props.footerVisible
      ? props.withHeader
        ? `calc(100% - 16px - ${props.footerHeight}px - ${props.headerHeight}px)`
        : `calc(100% - 16px - ${props.footerHeight}px)`
      : props.withHeader
        ? `calc(100% - 16px - ${props.headerHeight}px)`
        : `calc(100% - 16px)`};

  padding: 16px 0 0 0;

  .search-input,
  .search-loader {
    padding: 0 16px;

    margin-bottom: 12px;
  }

  .body-description-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 12px;

    padding: 0 16px;

    color: ${(props) => props.theme.selector.bodyDescriptionText};
  }
`;

const StyledSelectAll = styled.div`
  width: 100%;
  max-height: 61px;
  height: 61px;
  min-height: 61px;

  display: flex;
  align-items: center;

  cursor: pointer;

  border-bottom: ${(props) => props.theme.selector.border};

  box-sizing: border-box;

  padding: 8px 16px 20px;

  .select-all_avatar {
    min-width: 32px;
  }

  .label {
    width: 100%;
    max-width: 100%;

    line-height: 16px;

    margin-left: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-left: 0;
        margin-right: 8px;
      `}
  }

  .checkbox {
    svg {
      margin-right: 0px;
    }
  }
`;

const selectedCss = css`
  background: ${(props) =>
    props.theme.selector.item.selectedBackground} !important;
`;

const StyledItem = styled.div<{
  isSelected: boolean | undefined;
  isDisabled?: boolean;
  isMultiSelect: boolean;
}>`
  display: flex;
  align-items: center;

  padding: 0 16px;

  box-sizing: border-box;

  .room-logo,
  .user-avatar {
    min-width: 32px;
  }

  .room-logo {
    height: 32px;

    border-radius: 6px;
  }

  .label {
    width: 100%;
    max-width: 100%;

    line-height: 18px;

    margin-left: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-left: 0;
        margin-right: 8px;
      `}
  }

  .checkbox {
    svg {
      margin-right: 0px;
    }
  }

  ${(props) =>
    props.isDisabled
      ? css`
          opacity: 0.5;
        `
      : css`
          ${props.isSelected && !props.isMultiSelect && selectedCss}
          @media (hover: hover) {
            &:hover {
              cursor: pointer;
              background: ${props.theme.selector.item.hoverBackground};
            }
          }
        `}
`;

const StyledEmptyScreen = styled.div<{ withSearch: boolean }>`
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;

  margin-top: ${(props) => (props.withSearch ? "80px" : "64px")};
  padding: 0 28px;

  box-sizing: border-box;

  .empty-image {
    max-width: 72px;
    max-height: 72px;

    margin-bottom: 32px;
  }

  .empty-header {
    font-weight: 700;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    line-height: 22px;

    margin: 0;
  }

  .empty-description {
    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    line-height: 16px;

    text-align: center;

    color: ${(props) => props.theme.selector.emptyScreen.descriptionColor};

    margin-top: 8px;
  }
`;

const StyledBreadCrumbs = styled.div<{
  itemsCount: number;
  gridTemplateColumns: string;
}>`
  width: 100%;
  height: 38px;

  padding: 0 16px 16px 16px;

  box-sizing: border-box;

  display: grid;

  grid-template-columns: ${(props) => props.gridTemplateColumns};

  grid-column-gap: 8px;

  align-items: center;

  .context-menu-button {
    transform: rotate(90deg);
    svg {
      path {
        fill: ${(props) => props.theme.selector.breadCrumbs.prevItemColor};
      }
    }
  }
`;

StyledBreadCrumbs.defaultProps = { theme: Base };

const StyledItemText = styled(Text)<{ isCurrent: boolean; isLoading: boolean }>`
  ${(props) =>
    !props.isCurrent &&
    css`
      color: ${props.theme.selector.breadCrumbs.prevItemColor};

      ${!props.isLoading && `cursor: pointer`};
    `}
`;

StyledItemText.defaultProps = { theme: Base };

const StyledArrowRightSvg = styled(ArrowRightSvg)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      transform: scaleX(-1);
    `}
  path {
    fill: ${(props) => props.theme.selector.breadCrumbs.arrowRightColor};
  }
`;

const StyledFooter = styled.div<{
  withFooterInput?: boolean;
  withFooterCheckbox?: boolean;
}>`
  width: calc(100% - 32px);
  max-height: ${(props) =>
    props.withFooterCheckbox
      ? "181px"
      : props.withFooterInput
        ? "145px"
        : "73px"};
  height: ${(props) =>
    props.withFooterCheckbox
      ? "181px"
      : props.withFooterInput
        ? "145px"
        : "73px"};
  min-height: ${(props) =>
    props.withFooterCheckbox
      ? "181px"
      : props.withFooterInput
        ? "145px"
        : "73px"};

  padding: 0 16px;

  border-top: ${(props) => props.theme.selector.border};

  .button {
    min-height: 40px;

    margin-bottom: 2px;
  }
`;

StyledFooter.defaultProps = { theme: Base };

const StyledNewNameContainer = styled.div`
  margin-top: 16px;

  .new-file-input {
    margin-bottom: 16px;
  }
`;

const StyledNewNameHeader = styled(Text)`
  margin-bottom: 4px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-top: 16px;
`;

const StyledComboBox = styled(ComboBox)`
  margin-bottom: 2px;
  max-height: 50px;

  .combo-button {
    min-height: 40px;
  }

  .combo-button-label,
  .combo-button-label:hover {
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    text-decoration: none;
  }
`;

StyledSelector.defaultProps = { theme: Base };
StyledHeader.defaultProps = { theme: Base };
StyledBody.defaultProps = { theme: Base };
StyledSelectAll.defaultProps = { theme: Base };
StyledItem.defaultProps = { theme: Base };
StyledEmptyScreen.defaultProps = { theme: Base };
StyledArrowRightSvg.defaultProps = { theme: Base };
StyledComboBox.defaultProps = { theme: Base };

export {
  StyledSelector,
  StyledHeader,
  StyledBody,
  StyledSelectAll,
  StyledItem,
  StyledEmptyScreen,
  StyledBreadCrumbs,
  StyledItemText,
  StyledArrowRightSvg,
  StyledFooter,
  StyledNewNameContainer,
  StyledNewNameHeader,
  StyledButtonContainer,
  StyledComboBox,
};
