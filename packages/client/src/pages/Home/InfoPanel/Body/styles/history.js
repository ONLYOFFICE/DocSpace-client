import styled, { css } from "styled-components";

import { Base } from "@docspace/shared/themes";

const StyledHistoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHistorySubtitle = styled.div`
  position: sticky;
  background: ${(props) => props.theme.infoPanel.backgroundColor};
  top: 80px;
  z-index: 99;

  padding: 8px 0 12px;
  font-weight: 600;
  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  line-height: 20px;
  color: ${(props) => props.theme.infoPanel.history.subtitleColor};
`;

const StyledUserNameLink = styled.span`
  display: inline-block;

  white-space: normal;
  margin: 1px 0;

  .username {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 600;
    display: inline-block;
  }

  .link {
    text-decoration: underline;
    text-decoration-style: dashed;
    text-underline-offset: 2px;
  }

  .space {
    display: inline-block;
    width: 4px;
    height: 15px;
  }
`;

const StyledHistoryBlock = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  padding: 8px 0;

  ${({ withBottomDivider, theme }) =>
    withBottomDivider
      ? ` border-bottom: solid 1px ${theme.infoPanel.borderColor}; `
      : ` margin-bottom: 12px; `}

  .avatar {
    min-width: 32px;
  }

  .info {
    width: calc(100% - 40px);
    max-width: calc(100% - 40px);
    display: ${(props) => `solid 1px ${props.theme.infoPanel.borderColor}`};
    flex-direction: column;
    gap: 2px;

    .title {
      display: flex;
      flex-direction: row;
      gap: 4px;
      .name {
        font-weight: 600;
        font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .date {
        white-space: nowrap;
        display: inline-block;
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: auto;
              `
            : css`
                margin-left: auto;
              `}
        font-weight: 600;
        font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
        color: ${(props) => props.theme.infoPanel.history.dateColor};
      }
    }
  }

  ${(props) =>
    props.isUserAction &&
    css`
      .info {
        flex-direction: row;
        flex-wrap: wrap;
        .message {
          display: inline-block;
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? css`
                  margin-left: 4px;
                `
              : css`
                  margin-right: 4px;
                `}
        }
      }
    `}
`;

const StyledHistoryBlockMessage = styled.div`
  font-weight: 400;
  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  line-height: 20px;

  display: flex;
  gap: 4px;

  .main-message {
    width: max-content;
    max-width: 100%;
    min-width: max-content;
  }

  strong {
    max-width: 100%;
    display: inline-block;
    vertical-align: top;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .folder-label {
    max-width: 100%;
    color: ${(props) => props.theme.infoPanel.history.locationIconColor};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const StyledHistoryBlockFilesList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: ${(props) => props.theme.infoPanel.history.fileBlockBg};
  border-radius: 3px;

  .show_more-link {
    cursor: pointer;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 10px 20px 3px 0;
          `
        : css`
            margin: 10px 0 3px 20px;
          `}
    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: 15px;

    strong {
      font-weight: 600;
      text-decoration: underline;
      text-decoration-style: dashed;
      text-underline-offset: 2px;
    }
  }
`;

const StyledHistoryBlockFile = styled.div`
  padding: 4px 16px;
  display: flex;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: start;

  .icon {
    width: 24px;
    height: 24px;
    svg {
      width: 24px;
      height: 24px;
    }
  }

  .item-title {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    display: flex;
    min-width: 0;
    gap: 0;

    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .exst {
      flex-shrink: 0;
      color: ${(props) => props.theme.infoPanel.history.fileExstColor};
    }
  }

  .location-btn {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
    min-width: 16px;
  }
`;

StyledHistorySubtitle.defaultProps = { theme: Base };
StyledHistoryBlock.defaultProps = { theme: Base };
StyledHistoryBlockMessage.defaultProps = { theme: Base };
StyledHistoryBlockFilesList.defaultProps = { theme: Base };
StyledHistoryBlockFile.defaultProps = { theme: Base };

export {
  StyledHistoryList,
  StyledHistorySubtitle,
  StyledUserNameLink,
  StyledHistoryBlock,
  StyledHistoryBlockMessage,
  StyledHistoryBlockFilesList,
  StyledHistoryBlockFile,
};
