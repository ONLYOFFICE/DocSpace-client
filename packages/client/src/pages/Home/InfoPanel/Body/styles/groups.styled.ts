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
          font-size: 14px;
          font-weight: 600;
          line-height: 16px;
        }
        .badge {
        }
      }

      .email {
        color: #a3a9ae;
        font-size: 10px;
        font-style: normal;
        font-weight: 400;
      }
    }

    .context-btn-wrapper {
      display: flex;
      flex-direction: row;
      gap: 16px;
      margin-left: auto;
      .group-manager-tag {
        color: #d0d5da;
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
      }
    }
  }
`;
