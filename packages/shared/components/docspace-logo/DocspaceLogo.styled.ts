import styled from "styled-components";

import { mobile } from "@docspace/shared/utils";

export const StyledWrapper = styled.div`
  .logo-wrapper {
    width: 386px;
    height: 44px;
  }

  @media ${mobile} {
    display: none;
  }
`;
