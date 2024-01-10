import styled from "styled-components";

export const Header = styled.div`
  width: 100%;
  padding: 8px 0 12px 0;

  color: #a3a9ae;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
`;

export const AddMembersButton = styled.div<{}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: max-content;
  height: 32px;
  cursor: pointer;
  margin: 8px 0;

  .add-button {
    width: 32px;
    height: 32px;
    background-color: #eceef1;
    display: flex;
    align-items: center;
    justify-content: center;

    .plus-icon: {
      svg {
        path {
          fill: #657077;
        }
      }
    }
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    color: #a3a9ae;
  }
`;
