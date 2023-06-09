import styled from "styled-components";
import { Base } from "@docspace/components/themes";
import { hugeMobile } from "@docspace/components/utils/device";

const FillingStatusContainer = styled.div`
  width: 100%;
  max-width: 450px;
  margin: 10px auto;

  @media ${hugeMobile} {
    max-width: 350px;
  }

  .status-done-text,
  .status-interrupted-text {
    font-size: 14px;
    line-height: 16px;
    font-weight: bold;
  }

  .status-done-text {
    color: ${(props) =>
      props.isDone
        ? props.theme.statusPanel.doneTextColor
        : props.theme.statusPanel.defaultTextColor};
  }

  .status-done-icon {
    circle,
    path {
      stroke: ${(props) =>
        props.isDone
          ? props.theme.statusPanel.doneTextColor
          : props.theme.statusPanel.defaultTextColor};
    }
  }

  .status-interrupted-text {
    color: ${(props) =>
      props.isInterrupted && props.theme.statusPanel.interruptedTextColor};
  }

  .status-interrupted-icon {
    circle,
    path {
      stroke: ${(props) =>
        props.isInterrupted && props.theme.statusPanel.interruptedTextColor};
    }
  }

  .status-done-icon,
  .status-interrupted-icon {
    margin-right: 10px;
  }
`;

FillingStatusContainer.defaultProps = { theme: Base };

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
      padding 1px;
      border-radius: 50%;
      border: 2px solid ${(props) => props.theme.statusPanel.avatarBorderColor};
      border-color: ${(props) =>
        (props.isDone && props.theme.statusPanel.doneTextColor) ||
        (props.isInterrupted && props.theme.statusPanel.interruptedTextColor)};
    }

    .accordion-displayname {
      font-size: 14px;
      font-weight: bold;
      line-height: 16px;
      color: ${(props) => props.theme.statusPanel.displayNameColor};
      margin-left: 10px;
    }

    .accordion-role {
      font-size: 12px;
      line-height: 16px;
      color: ${(props) => props.theme.statusPanel.roleTextColor};
      margin-left: 10px;
    }
  
    .arrow-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: ${(props) =>
        props.isOpen ? "rotate(270deg)" : "rotate(90deg)"};
      path { 
        fill: ${(props) =>
          props.isOpen
            ? props.theme.statusPanel.doneTextColor
            : props.theme.statusPanel.arrowIconColor};
      }
    }
  }

  .accordion-item-history {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 15px;

    .status-date {
      color: ${(props) => props.theme.statusPanel.fillingTextColor};
    }
  }

  .accordion-item-wrapper {
    display: flex;
    align-items: center;
    min-height: 40px;
    margin: ${(props) => (props.isDone || props.isInterrupted ? "0" : "2px 0")};
    border-left: 2px ${(props) =>
      props.isDone || props.isInterrupted ? "solid" : "dashed"} 
      ${(props) => props.theme.statusPanel.defaultTextColor};
    border-color: ${(props) =>
      (props.isDone && props.theme.statusPanel.doneTextColor) ||
      (props.isInterrupted && props.theme.statusPanel.interruptedTextColor)};

    .status-text {
      margin-left: 15px;
      color: ${(props) => props.theme.statusPanel.fillingTextColor};
    }

    .filled-status-text {
      font-size: 12px;
      line-height: 16px;
      margin-left: 15px;
      color: ${(props) =>
        props.isDone
          ? props.theme.statusPanel.doneTextColor
          : props.theme.statusPanel.fillingTextColor};
    }
  }
`;

AccordionItem.defaultProps = { theme: Base };

export { FillingStatusContainer, AccordionItem };
