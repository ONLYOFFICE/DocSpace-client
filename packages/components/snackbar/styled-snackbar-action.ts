import styled from "styled-components";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/cross.react.... Remove this comment to see the full error message
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";
import commonIconsStyles from "../utils/common-icons-style";

const StyledCrossIcon = styled(CrossReactSvg)`
  ${commonIconsStyles}

  path {
    fill: #999976;
  }
`;

export default StyledCrossIcon;
