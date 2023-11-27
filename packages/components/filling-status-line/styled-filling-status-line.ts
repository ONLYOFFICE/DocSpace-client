import styled from "styled-components";
import { Base } from "../themes";

const FillingStatusContainer = styled.div`
  width: 100%;
  max-width: 425px;
  padding: 10px;

  .status-done-text {
    // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    color: ${(props) => (props.isDone ? "#4781D1" : "#A3A9AE")};
  }

  .status-done-icon {
    circle,
    path {
      // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      stroke: ${(props) => (props.isDone ? "#4781D1" : "#A3A9AE")};
    }
  }

  .status-interrupted-text {
    // @ts-expect-error TS(2339): Property 'isInterrupted' does not exist on type 'T... Remove this comment to see the full error message
    color: ${(props) => props.isInterrupted && "#F2675A"};
  }

  .status-interrupted-icon {
    circle,
    path {
      // @ts-expect-error TS(2339): Property 'isInterrupted' does not exist on type 'T... Remove this comment to see the full error message
      stroke: ${(props) => props.isInterrupted && "#F2675A"};
    }
  }

  .status-done-icon,
  .status-interrupted-icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `margin-left: 10px;`
        : `margin-right: 10px;`}
  }
`;

const AccordionItem = styled.div`
  width: 100%;

  .accordion-item-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    height: 38px;
    padding: 18px 0;

    .user-avatar {
      padding: 1px;
      border: 2px solid #a3a9ae;
      border-color: ${(props) =>
        // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
        (props.isDone && "#4781D1") || (props.isInterrupted && "#F2675A")};
      border-radius: 50%;
    }

    .accordion-displayname {
      color: ${(props) => props.theme.color};
    }

    .accordion-role {
      color: ${(props) => (props.theme.isBase ? "#657077" : "#FFFFFF99")};
    }

    .arrow-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: ${(props) =>
        // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
        props.isOpen ? "rotate(270deg)" : "rotate(90deg)"};
      path {
        // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
        fill: ${(props) => (props.isOpen ? "#4781d1" : "#A3A9AE")};
      }
    }
  }

  .accordion-item-history {
    display: flex;
    align-items: center;
    justify-content: space-between;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `padding-right: 15px;`
        : `padding-left: 15px;`}
  }

  .accordion-item-wrapper {
    display: flex;
    align-items: center;
    min-height: 40px;
    // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    margin: ${(props) => (props.isDone || props.isInterrupted ? "0" : "2px 0")};

    ${(props) => {
      const borderValue = `2px ${
        // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
        props.isDone || props.isInterrupted ? "solid" : "dashed"
      } #A3A9AE;`;

      return props.theme.interfaceDirection === "rtl"
        ? `border-right: ${borderValue}`
        : `border-left: ${borderValue}`;
    }}
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      (props.isDone && "#4781D1") || (props.isInterrupted && "#F2675A")};

    .status-text {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? `margin-right: 15px;`
          : `margin-left: 15px;`}
      color: ${(props) => (props.theme.isBase ? "#657077" : "#FFFFFF99")};
    }

    .status-date {
      color: ${(props) => (props.theme.isBase ? "#657077" : "#FFFFFF99")};
    }

    .filled-status-text {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? `margin-right: 15px;`
          : `margin-left: 15px;`}
      // @ts-expect-error TS(2339): Property 'isDone' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      color: ${(props) => (props.isDone ? "#4781D1" : "#657077")};
    }
  }
`;

AccordionItem.defaultProps = { theme: Base };

export { FillingStatusContainer, AccordionItem };
