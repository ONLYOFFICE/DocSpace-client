import styled, { css } from "styled-components";
import { NoUserSelect } from "../../utils";
import { TColorScheme, TTheme, Base } from "../../themes";

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

const StyledMainButton = styled.div<{
  isDisabled?: boolean;
  isDropdown?: boolean;
}>`
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
    margin: ${(props) => props.theme.mainButton.svg.margin};
    height: ${(props) => props.theme.mainButton.svg.height};
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

const disableStyles = css`
  opacity: 0.6;

  &:hover {
    opacity: 0.6;
    cursor: default;
  }

  &:active {
    opacity: 0.6;
    cursor: default;
    filter: none;
  }
`;

const getDefaultStyles = ({
  $currentColorScheme,
  isDisabled,
  theme,
}: {
  $currentColorScheme?: TColorScheme;
  theme: TTheme;
  isDisabled?: boolean;
}) =>
  $currentColorScheme &&
  css`
    background-color: ${$currentColorScheme.main?.accent};

    &:hover {
      background-color: ${$currentColorScheme.main?.accent};
      opacity: 0.85;
      cursor: pointer;
    }

    &:active {
      background-color: ${$currentColorScheme.main?.accent};
      opacity: 1;
      filter: ${theme.isBase ? "brightness(90%)" : "brightness(82%)"};
      cursor: pointer;
    }

    .main-button_text {
      color: ${$currentColorScheme.text?.accent};
    }

    .main-button_img svg path {
      fill: ${$currentColorScheme.text?.accent};
    }

    ${isDisabled &&
    `
    ${disableStyles}
    `}
  `;

const StyledThemeMainButton = styled(StyledMainButton)(getDefaultStyles);

export { StyledThemeMainButton };
