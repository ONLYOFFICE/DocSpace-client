import styled, { css } from "styled-components";
import Base from "../themes/base";
import { mobile } from "../utils/device";

const StyledComboBox = styled.div`
  width: ${(props) =>
    // @ts-expect-error TS(2339): Property 'scaled' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    (props.scaled && "100%") ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "base" && props.theme.comboBox.width.base) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "middle" && props.theme.comboBox.width.middle) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "big" && props.theme.comboBox.width.big) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "huge" && props.theme.comboBox.width.huge) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "content" && "fit-content")};

  position: relative;
  outline: 0;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  // @ts-expect-error TS(2339): Property 'withoutPadding' does not exist on type '... Remove this comment to see the full error message
  padding: ${(props) => (props.withoutPadding ? "0" : "4px 0")};

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    props.isOpen &&
    // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
    props.noBorder &&
    css`
      background: ${(props) => props.theme.comboBox.background};
      border-radius: 3px;
    `}

  .dropdown-container {
    padding: ${(props) =>
      // @ts-expect-error TS(2339): Property 'advancedOptions' does not exist on type ... Remove this comment to see the full error message
      props.advancedOptions && props.theme.comboBox.padding};

    ${(props) =>
      // @ts-expect-error TS(2339): Property 'disableMobileView' does not exist on typ... Remove this comment to see the full error message
      !props.disableMobileView &&
      css`
        @media ${mobile} {
          position: fixed;
          top: unset !important;
          right: 0;
          left: 0;
          bottom: 0 !important;
          width: 100%;
          width: -moz-available;
          width: -webkit-fill-available;
          width: fill-available;
          border: none;
          border-radius: 6px 6px 0px 0px;
        }
      `}
  }

  -webkit-user-select: none;

  .backdrop-active {
    z-index: 210;
  }
`;

StyledComboBox.defaultProps = {
  theme: Base,
};

export default StyledComboBox;
