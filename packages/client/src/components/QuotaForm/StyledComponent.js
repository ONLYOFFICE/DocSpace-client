import styled, { css } from "styled-components";

const StyledBody = styled.div`
  display: flex;
  grid-gap: 4px;

  .quota_limit {
    ${(props) => props.maxInputWidth && `max-width: ${props.maxInputWidth}`};
    max-height: 32px;
  }

  .quota_value {
    max-width: fit-content;
    padding: 0;
  }
`;

export default StyledBody;
