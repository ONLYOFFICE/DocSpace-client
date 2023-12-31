import styled, { css } from "styled-components";

import { mobile } from "../../../utils/device";

const StyledWrapper = styled.div`
  #ipl-progress-indicator {
    position: fixed;
    z-index: 390;
    top: 0;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `right: -6px;` : `left: -6px;`}
    width: 0%;
    height: 3px;
    -moz-border-radius: 1px;
    -webkit-border-radius: 1px;
    border-radius: 1px;

    @media ${mobile} {
      top: 48px;
    }
  }
`;

export default StyledWrapper;
