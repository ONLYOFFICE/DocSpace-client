import styled from "styled-components";

export const Wrapper = styled.div`
  .users-without-email {
    font-size: 12px;
    margin: 0 0 16px;
  }

  .upper-buttons {
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .data-import-progress-bar {
    width: 350px;
    margin: 12px 0 16px;
  }

  .save-cancel-buttons {
    margin-bottom: 16px;
  }

  .mt-8 {
    margin-top: 8px;
  }

  .mb-17 {
    margin-bottom: 17px;
  }
`;

export const UsersInfoBlock = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: #f8f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  .selected-users-count {
    margin-right: 24px;
  }

  .selected-admins-count {
    margin-right: 8px;
  }
`;
