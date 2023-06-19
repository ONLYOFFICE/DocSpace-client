import styled from "styled-components";
import Base from "../themes/base";
import { AddRoleButton, EveryoneRoleIcon } from "./svg";

const StyledFillingRoleSelector = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .list-header {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    padding: 8px 0;
  }
`;

const StyledRow = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;

  @media (hover: hover) {
    &:hover {
      background: ${(props) => props.theme.selector.item.hoverBackground};
    }
  }
`;

const StyledUserRow = styled.div`
  height: 48px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  .content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: calc(100% - 32px - 12px);
  }

  .user-with-role {
    display: flex;
    flex-direction: column;
    width: inherit;

    .user {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media (hover: hover) {
    &:hover {
      background: ${(props) => props.theme.selector.item.hoverBackground};
    }
  }

  .remove-image {
    @media (hover: hover) {
      &:hover {
        cursor: pointer;
      }
    }
  }
`;

const StyledAssignedRole = styled.div`
  color: rgba(170, 170, 170, 1);

  font-weight: 400;
  font-size: 10px;
  line-height: 14px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledNumber = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: #a3a9ae;
`;

const StyledAvatar = styled.img`
  min-width: 32px;
  height: 32px;
  width: 32px;
  border-radius: 50%;
`;

const StyledAddRoleButton = styled(AddRoleButton)`
  min-width: 32px;
  width: 32px;
  height: 32px;

  path {
    fill: ${(props) => props.color};
  }

  rect {
    stroke: ${(props) => props.color};
  }

  @media (hover: hover) {
    &:hover {
      cursor: pointer;
    }
  }
`;

const StyledEveryoneRoleIcon = styled(EveryoneRoleIcon)`
  min-width: 32px;
  width: 32px;
  height: 32px;
`;

const StyledRole = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledEveryoneRoleContainer = styled.div`
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
  }

  .role-description {
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    color: #657077;
  }
`;

const StyledTooltip = styled.div`
  display: ${(props) => (props.visibleTooltip ? "flex" : "none")};
  flex-direction: column;

  background: #f8f9f9;
  border-radius: 6px;
  font-size: 12px;
  line-height: 16px;
  padding: 8px 12px;
  box-sizing: border-box;
  margin: 8px 0;

  .help-icon {
    path,
    circle,
    rect {
      fill: #ed7309;
    }
  }

  .cross-icon {
    path {
      fill: #a3a9ae;
    }

    &:hover {
      cursor: pointer;
    }
  }

  .title-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 4px;
  }

  .title-tooltip {
    display: flex;
    gap: 8px;
  }

  .title {
    font-weight: 600;
  }

  .description {
    color: #555f65;
    font-weight: 400;
  }
`;

StyledFillingRoleSelector.defaultProps = { theme: Base };

export {
  StyledFillingRoleSelector,
  StyledRow,
  StyledNumber,
  StyledAddRoleButton,
  StyledEveryoneRoleIcon,
  StyledRole,
  StyledEveryoneRoleContainer,
  StyledTooltip,
  StyledAssignedRole,
  StyledAvatar,
  StyledUserRow,
};
