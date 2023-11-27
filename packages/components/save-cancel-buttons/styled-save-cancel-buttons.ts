import styled, { css } from "styled-components";
import Base from "../themes/base";
import { mobileMore, mobile } from "../utils/device";

const displaySettings = css`
  position: absolute;
  display: block;
  flex-direction: column-reverse;
  align-items: flex-start;
  border-top: ${(props) =>
    // @ts-expect-error TS(2339): Property 'hasScroll' does not exist on type 'Theme... Remove this comment to see the full error message
    props.hasScroll && !props.showReminder && !props.hideBorder
      ? "1px solid #ECEEF1"
      : "none"};

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'hasScroll' does not exist on type 'Theme... Remove this comment to see the full error message
    props.hasScroll &&
    css`
      bottom: auto;
    `}

  .buttons-flex {
    display: flex;
    width: 100%;

    box-sizing: border-box;

    @media ${mobile} {
      padding: 16px;
      bottom: 0;
    }
  }

  .unsaved-changes {
    position: absolute;
    padding-top: 16px;
    padding-bottom: 16px;
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    font-weight: 600;
    width: calc(100% - 32px);
    bottom: 56px;
    background-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'hasScroll' does not exist on type 'Theme... Remove this comment to see the full error message
      props.hasScroll
        ? props.theme.mainButtonMobile.buttonWrapper.background
        : "none"};

    @media ${mobile} {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 16px;
            `
          : css`
              padding-left: 16px;
            `}
    }
  }

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'showReminder' does not exist on type 'Th... Remove this comment to see the full error message
    props.showReminder &&
    // @ts-expect-error TS(2339): Property 'hasScroll' does not exist on type 'Theme... Remove this comment to see the full error message
    props.hasScroll &&
    css`
      .unsaved-changes {
        border-top: 1px solid #eceef1;
        width: calc(100% - 16px);

        ${props.theme.interfaceDirection === "rtl"
          ? css`
              right: 0;
              padding-right: 16px;
            `
          : css`
              left: 0;
              padding-left: 16px;
            `}
      }
    `}
`;

const tabletButtons = css`
  position: static;
  display: flex;
  max-width: none;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  border-top: none;

  .buttons-flex {
    width: auto;
  }

  .unsaved-changes {
    border-top: none;
    position: static;
    padding: 0;
    margin-bottom: 0;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? "margin-right: 8px;"
        : "margin-left: 8px;"}
  }
`;

const StyledSaveCancelButtons = styled.div`
  display: flex;
  position: absolute;
  justify-content: space-between;
  box-sizing: border-box;
  align-items: center;
  bottom: ${(props) => props.theme.saveCancelButtons.bottom};
  width: ${(props) => props.theme.saveCancelButtons.width};

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? `right: ${props.theme.saveCancelButtons.left};`
      : `left: ${props.theme.saveCancelButtons.left};`}

  .save-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `margin-left: ${props.theme.saveCancelButtons.marginRight};`
        : `margin-right: ${props.theme.saveCancelButtons.marginRight};`}
  }
  .unsaved-changes {
    color: ${(props) => props.theme.saveCancelButtons.unsavedColor};
  }

  // @ts-expect-error TS(2339): Property 'displaySettings' does not exist on type ... Remove this comment to see the full error message
  ${(props) => props.displaySettings && displaySettings};

  @media ${mobileMore} {
    // @ts-expect-error TS(2339): Property 'displaySettings' does not exist on type ... Remove this comment to see the full error message
    ${(props) => props.displaySettings && tabletButtons}
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'displaySettings' does not exist on type ... Remove this comment to see the full error message
      !props.displaySettings &&
      `
        justify-content: flex-end;
        position: fixed;

        .unsaved-changes {
          display: none;
        }
  `}
  }
`;
StyledSaveCancelButtons.defaultProps = { theme: Base };
export default StyledSaveCancelButtons;
