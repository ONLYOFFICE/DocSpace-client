import { tablet } from "@docspace/components/utils/device";

import styled from "styled-components";

const StyledContainer = styled.div`
  width: 211px;
  margin: 0;

  @media ${tablet} {
    display: none;
  }
`;

export default StyledContainer;
