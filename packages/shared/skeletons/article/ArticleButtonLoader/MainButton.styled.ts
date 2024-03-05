import styled from "styled-components";

import { tablet } from "../../../utils";

const StyledContainer = styled.div`
  width: 211px;
  margin: 0;

  @media ${tablet} {
    display: none;
  }
`;

export default StyledContainer;
