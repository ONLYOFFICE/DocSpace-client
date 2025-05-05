import styled from "styled-components";

import ArrowRightSvg from "PUBLIC_DIR/images/arrow.right.react.svg";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledArrowRightSvg = styled(ArrowRightSvg).attrs(injectDefaultTheme)`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}

  path {
    fill: ${(props) => props.theme.selector.breadCrumbs.arrowRightColor};
  }
`;

export { StyledArrowRightSvg };
