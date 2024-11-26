import styled, { css } from "styled-components";

import { injectDefaultTheme } from "../../utils";

const StyledRoomType = styled.div`
  cursor: pointer;
  user-select: none;
  outline: 0;

  padding: 16px;
  width: 100%;
  box-sizing: border-box;

  display: flex;
  gap: 12px;
  align-items: center;

  .choose_room-logo_wrapper {
    width: 32px;
    margin-bottom: auto;
  }

  .choose_room-info_wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .choose_room-title {
      display: flex;
      flex-direction: row;
      gap: 6px;
      align-items: center;
      .choose_room-title-text {
        font-weight: 600;
        font-size: 14px;
        line-height: 16px;
      }
    }
    .choose_room-description {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
    }
  }

  .choose_room-forward_btn {
    ${(props) =>
      props.theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    margin-inline-start: auto;
    max-width: 17px;
    max-height: 17px;
    min-width: 17px;
    min-height: 17px;
  }
`;

const StyledListItem = styled(StyledRoomType).attrs(injectDefaultTheme)<{
  isOpen: boolean;
}>`
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.listItem.background};
  border: 1px solid
    ${(props) => props.theme.createEditRoomDialog.roomType.listItem.borderColor};
  border-radius: 6px;

  &:hover:not(:active) {
    background-color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.listItem.hoverBackground};
  }

  &:active {
    border-color: ${(props) => props.theme.currentColorScheme?.main.accent};
  }

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.listItem.descriptionText};
  }
`;

const StyledDropdownButton = styled(StyledRoomType).attrs(injectDefaultTheme)<{
  isOpen: boolean;
}>`
  border-radius: 6px;
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.dropdownButton.background};

  ${(props) =>
    !props.isOpen &&
    css`
      &:hover:not(:active) {
        background-color: ${props.theme.createEditRoomDialog.roomType
          .dropdownButton.hoverBackground};
      }
    `}

  border: 1px solid
    ${(props) =>
    props.isOpen
      ? props.theme.currentColorScheme?.main.accent
      : props.theme.createEditRoomDialog.roomType.dropdownButton.borderColor};

  &:active {
    border-color: ${(props) => props.theme.currentColorScheme?.main.accent};
  }

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.dropdownButton.descriptionText};
  }

  .choose_room-forward_btn {
    &.dropdown-button {
      transform: ${(props) =>
        props.isOpen ? "rotate(-90deg)" : "rotate(90deg)"};
    }
  }
`;

const StyledDropdownItem = styled(StyledRoomType).attrs(injectDefaultTheme)`
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.dropdownItem.background};

  &:hover {
    background-color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.dropdownItem.hoverBackground};
  }

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.dropdownItem.descriptionText};
  }

  .choose_room-forward_btn {
    display: none;
  }
`;

const StyledDisplayItem = styled(StyledRoomType).attrs(injectDefaultTheme)`
  cursor: default;
  background-color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.displayItem.background};
  border: 1px solid
    ${(props) =>
      props.theme.createEditRoomDialog.roomType.displayItem.borderColor};
  border-radius: 6px;

  .choose_room-description {
    color: ${(props) =>
      props.theme.createEditRoomDialog.roomType.displayItem.descriptionText};
  }

  .choose_room-forward_btn {
    display: none;
  }
`;

export {
  StyledDisplayItem,
  StyledDropdownButton,
  StyledDropdownItem,
  StyledListItem,
};
