import styled, { css } from "styled-components";

export const GroupsContent = styled.div<{}>`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin: 128px 0 0 auto;
        `
      : css`
          margin: 128px auto 0 0;
        `}

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
          font-size: 14px;
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
        font-size: 10px;
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
      margin-left: auto;
      .group-manager-tag {
        white-space: nowrap;
        color: #d0d5da;
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
      }
    }
  }
`;
