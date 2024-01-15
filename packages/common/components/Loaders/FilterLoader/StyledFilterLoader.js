import styled, { css } from "styled-components";

import { mobile } from "@docspace/shared/utils";

const StyledFilter = styled.div`
  width: 100%;
  height: 40px;
  display: grid;
  grid-template-columns: 1fr 95px;
  grid-template-rows: 1fr;
  grid-column-gap: 8px;

  @media ${mobile} {
    grid-template-columns: 1fr 50px;
  }
`;

export default StyledFilter;
