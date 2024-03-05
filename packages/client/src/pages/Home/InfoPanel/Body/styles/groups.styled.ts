import styled, { css } from "styled-components";

export const GroupsContent = styled.div<{}>`
  margin-top: 128px;
  margin-inline-start: auto;

  .group-member {
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .avatar {
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: start;

      .name-wrapper {
        display: flex;
        flex-direction: row;
        gap: 4px;
        .name {
          max-width: 180px;
          font-size: ${({ theme }) => theme.getCorrectFontSize("14px")};
          font-weight: 600;
          line-height: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge {
        }
      }

      .email {
        max-width: 180px;
        color: #a3a9ae;
        font-size: ${({ theme }) => theme.getCorrectFontSize("10px")};
        font-style: normal;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .context-btn-wrapper {
      display: flex;
      flex-direction: row;
      gap: 16px;
      margin-inline-start: auto;
      .group-manager-tag {
        white-space: nowrap;
        color: #d0d5da;
        font-size: ${({ theme }) => theme.getCorrectFontSize("12px")};
        font-weight: 600;
        line-height: 16px;
      }
    }
  }
`;
