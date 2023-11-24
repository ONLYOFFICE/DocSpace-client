import Submenu from "@docspace/components/submenu";
import { tablet } from "@docspace/components/utils/device";
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
