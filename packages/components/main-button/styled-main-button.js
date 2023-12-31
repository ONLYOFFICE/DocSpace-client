import styled, { css } from "styled-components";
import NoUserSelect from "../utils/commonStyles";
import Base from "../themes/base";

const hoveredCss = css`
  background-color: ${(props) => props.theme.mainButton.hoverBackgroundColor};
  cursor: pointer;
`;
const clickCss = css`
  background-color: ${(props) => props.theme.mainButton.clickBackgroundColor};
  cursor: pointer;
`;

const notDisableStyles = css`
  &:hover {
    ${hoveredCss}
  }

  &:active {
    ${clickCss}
  }
`;

const notDropdown = css`
  &:after {
    display: none;
  }
`;

const GroupMainButton = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
`;

const StyledMainButton = styled.div`
  ${NoUserSelect}

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  position: relative;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  box-sizing: border-box;

  background-color: ${(props) =>
    props.isDisabled
      ? `${props.theme.mainButton.disableBackgroundColor}`
      : `${props.theme.mainButton.backgroundColor}`};

  padding: ${(props) => props.theme.mainButton.padding};
  border-radius: ${(props) => props.theme.mainButton.borderRadius};
  -moz-border-radius: ${(props) => props.theme.mainButton.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.mainButton.borderRadius};
  line-height: ${(props) => props.theme.mainButton.lineHeight};
  border-radius: 3px;

  ${(props) => !props.isDisabled && notDisableStyles}
  ${(props) => !props.isDropdown && notDropdown}

    & > svg {
    display: block;
    margin: ${(props) => props.theme.mainButton.margin};
    height: ${(props) => props.theme.mainButton.height};
  }

  .main-button_text {
    display: inline;
    font-size: ${(props) =>
      props.theme.getCorrectFontSize(props.theme.mainButton.fontSize)};
    font-weight: ${(props) => props.theme.mainButton.fontWeight};
    color: ${(props) =>
      !props.isDisabled
        ? props.theme.mainButton.textColor
        : props.theme.mainButton.textColorDisabled};
  }

  .main-button_img {
    svg {
      padding-bottom: 1px;
      path {
        fill: #fff;
      }
    }
  }
`;
StyledMainButton.defaultProps = { theme: Base };

export { StyledMainButton, GroupMainButton };
