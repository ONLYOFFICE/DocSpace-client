import styled from "styled-components";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/danger.toast... Remove this comment to see the full error message
import InfoReactSvg from "PUBLIC_DIR/images/danger.toast.react.svg";
import commonIconsStyles from "../utils/common-icons-style";

const StyledLogoIcon = styled(InfoReactSvg)`
  ${commonIconsStyles}

  path {
    fill: ${(props) => props.color};
  }
`;

export default StyledLogoIcon;
