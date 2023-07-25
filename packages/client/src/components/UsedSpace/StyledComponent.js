import styled, { css } from "styled-components";

const StyledBody = styled.div`
  ${(props) => props.hideColumns && "overflow:hidden"};

  .info-account-quota {
    display: flex;
    p {
      padding-top: 8px;
    }
  }
  .combo-button {
    padding-left: 0px;
  }
`;

export default StyledBody;
