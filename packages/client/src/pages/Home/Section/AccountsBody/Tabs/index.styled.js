import { Submenu } from "@docspace/shared/components/submenu";
import { tablet } from "@docspace/shared/utils/device";
import styled from "styled-components";

export const Tabs = styled(Submenu)`
  width: 100%;

  .sticky-indent {
    display: none;
  }

  @media ${tablet} {
    .sticky {
      margin-top: 8px;
    }
  }
`;
