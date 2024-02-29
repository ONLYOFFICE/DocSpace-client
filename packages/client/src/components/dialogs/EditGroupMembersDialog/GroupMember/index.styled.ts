import styled, { css } from "styled-components";
import { Base } from "@docspace/shared/themes";

export const GroupMember = styled.div<{ isExpect: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;

  .avatar {
    min-width: 32px;
    min-height: 32px;
  }

  .user_body-wrapper {
    overflow: auto;
  }

  .name-wrapper,
  .role-email {
    display: flex;
  }

  .name {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `20px` : `16px`};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${(props) =>
      props.isExpect && `color: ${props.theme.infoPanel.members.isExpectName}`};
  }

  .me-label {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `20px` : `16px`};
    color: ${(props) => props.theme.infoPanel.members.meLabelColor};
    padding-inline-start: 8px;
    margin-inline-start: -8px;
  }

  .role-wrapper {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 8px;
            margin-right: auto;
          `
        : css`
            padding-left: 8px;
            margin-left: auto;
          `}

    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: 20px;
    white-space: nowrap;

    .disabled-role-combobox {
      color: ${(props) =>
        props.theme.infoPanel.members.disabledRoleSelectorColor};

      margin-inline-end: 16px;
    }
  }

  .role-view_remove-icon {
    cursor: pointer;
    svg {
      path {
        fill: ${(props) => props.theme.iconButton.color};
      }
    }

    :hover {
      svg {
        path {
          fill: ${(props) => props.theme.iconButton.hoverColor};
        }
      }
    }
  }
`;

GroupMember.defaultProps = { theme: Base };
