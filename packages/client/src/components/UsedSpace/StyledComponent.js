import styled, { css } from "styled-components";

const StyledBody = styled.div`
  overflow: hidden;
  width: 100%;
  max-width: max-content;

  .info-account-quota {
    display: flex;
    p {
      padding-top: 8px;
      ${(props) =>
        props.isDisabledQuotaChange &&
        css`
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `}
    }
  }
  .combo-button {
    padding-left: 0px;
  }
`;

export default StyledBody;
