import styled, { css } from "styled-components";

const StyledBody = styled.div`
  .quota-container {
    display: flex;
    grid-gap: 4px;
    margin-bottom: ${(props) => (props.isCheckbox ? "8px" : "16px")};
    ${(props) => props.isLabel && " margin-top: 8px"};
  }
  .quota_limit {
    ${(props) => props.maxInputWidth && `max-width: ${props.maxInputWidth}`};
    max-height: 32px;
  }

  .quota_value {
    max-width: fit-content;
    padding: 0;
  }

  .quota_description {
    color: ${(props) => props.theme.text.disableColor};
  }
`;

export default StyledBody;
