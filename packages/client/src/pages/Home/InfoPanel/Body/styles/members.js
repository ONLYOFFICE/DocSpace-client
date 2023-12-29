import styled, { css } from "styled-components";

import { Base } from "@docspace/shared/themes";

const StyledUserTypeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${(props) => (props.isExpect ? "20px" : "16px")};
  padding-bottom: 12px;

  .title {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: 20px;
    color: ${(props) => props.theme.infoPanel.members.subtitleColor};
  }

  .icon {
    margin-inline-end: 8px;
  }
`;

const StyledUserList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;

  .avatar {
    min-width: 32px;
    min-height: 32px;
  }

  .name {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${(props) =>
      props.isExpect && `color: ${props.theme.infoPanel.members.isExpectName}`};
  }

  .me-label {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: 16px;
    color: ${(props) => props.theme.infoPanel.members.meLabelColor};
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -8px;
          `
        : css`
            margin-left: -8px;
          `}
  }

  .role-wrapper {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: -12px;
            padding-right: 8px;
            margin-right: auto;
          `
        : css`
            margin-right: -12px;
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

StyledUserTypeHeader.defaultProps = { theme: Base };
export { StyledUserTypeHeader, StyledUserList, StyledUser };
