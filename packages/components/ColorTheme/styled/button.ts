import styled, { css } from "styled-components";
import StyledButton from "../../button/styled-button";
import Base from "../../themes/base";

const activeCss = css`
  // @ts-expect-error TS(2339): Property '$currentColorScheme' does not exist on t... Remove this comment to see the full error message
  border-color: ${(props) => props.$currentColorScheme.main?.buttons};

  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'primary' does not exist on type 'ThemedS... Remove this comment to see the full error message
    props.primary && props.$currentColorScheme.main?.buttons};

  // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
  opacity: ${(props) => !props.isDisabled && "1"};

  filter: ${(props) =>
    // @ts-expect-error TS(2339): Property 'primary' does not exist on type 'ThemedS... Remove this comment to see the full error message
    props.primary &&
    (props.theme.isBase ? "brightness(90%)" : "brightness(82%)")};
  // @ts-expect-error TS(2339): Property '$currentColorScheme' does not exist on t... Remove this comment to see the full error message
  color: ${(props) => props.$currentColorScheme.text?.buttons};
`;

const hoverCss = css`
  // @ts-expect-error TS(2339): Property '$currentColorScheme' does not exist on t... Remove this comment to see the full error message
  border-color: ${(props) => props.$currentColorScheme.main?.buttons};

  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'primary' does not exist on type 'ThemedS... Remove this comment to see the full error message
    props.primary && props.$currentColorScheme.main?.buttons};

  // @ts-expect-error TS(2339): Property 'primary' does not exist on type 'ThemedS... Remove this comment to see the full error message
  opacity: ${(props) => props.primary && !props.isDisabled && "0.85"};
  // @ts-expect-error TS(2339): Property 'primary' does not exist on type 'ThemedS... Remove this comment to see the full error message
  color: ${(props) => props.primary && props.$currentColorScheme.text?.buttons};
`;

const getDefaultStyles = ({
  primary,
  $currentColorScheme,
  isDisabled,
  isLoading,
  isClicked,
  isHovered,
  disableHover,
  title
}: any) =>
  $currentColorScheme &&
  !title &&
  css`
    ${primary &&
    css`
      background: ${$currentColorScheme.main?.buttons};
      opacity: ${isDisabled && "0.6"};
      border: ${`1px solid`} ${$currentColorScheme.main?.buttons};
      color: ${$currentColorScheme.text?.buttons};

      .loader {
        svg {
          color: ${$currentColorScheme.text?.buttons};
        }
        background-color: ${$currentColorScheme.main?.buttons};
      }
    `}

    ${!isDisabled &&
    !isLoading &&
    (isHovered && primary
      ? hoverCss
      : !disableHover &&
        primary &&
        css`
          &:hover,
          &:focus {
            ${hoverCss}
          }
        `)}

    ${!isDisabled &&
    !isLoading &&
    (isClicked
      ? primary && activeCss
      : primary &&
        css`
          &:active {
            ${activeCss}
          }
        `)}
  `;

StyledButton.defaultProps = { theme: Base };

export default styled(StyledButton)(getDefaultStyles);
