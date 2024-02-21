import styled from "styled-components";

export const GroupMemberRow = styled.div<{}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  width: 100%;
  height: 48px;

  .avatar {
  }

  .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 9px 0;

    .name {
      color: #333;
      font-size: ${({ theme }) => theme.getCorrectFontSize("14px")};
      font-weight: 600;
      line-height: 16px;
    }

    .email {
      color: #a3a9ae;
      font-size: ${({ theme }) => theme.getCorrectFontSize("10px")};
      font-weight: 400;
      line-height: normal;
    }
  }

  .remove-icon {
    cursor: pointer;
    margin-inline-start: auto;

    svg {
      path {
        fill: #a3a9ae;
      }
    }
  }
`;
