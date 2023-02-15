import styled, { css } from "styled-components";

const StyledBaseQuotaComponent = styled.div`
  .radio-button_content {
    margin-top: 16px;
  }
  .setting_quota {
    display: flex;
    grid-gap: 4px;

    .quota_limit {
      max-width: 50px;
      max-height: 32px;
    }
    .quota_value {
      max-width: fit-content;
      padding: 0;
    }
  }
`;
export { StyledBaseQuotaComponent };
