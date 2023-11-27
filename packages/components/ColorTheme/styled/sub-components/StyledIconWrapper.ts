import styled from "styled-components";
import Base from "../../../themes/base";

const StyledIconWrapper = styled.div`
  width: 17px;
  display: flex;
  // @ts-expect-error TS(2339): Property 'isRoot' does not exist on type 'ThemedSt... Remove this comment to see the full error message
  align-items: ${(props) => (props.isRoot ? "center" : "flex-end")};
  justify-content: center;

  svg {
    path {
      fill: ${(props) => props.theme.navigation.icon.fill};
    }

    circle {
      stroke: ${(props) => props.theme.navigation.icon.fill};
    }

    path:first-child {
      fill: none !important;
      stroke: ${(props) => props.theme.navigation.icon.stroke};
    }
  }
`;

StyledIconWrapper.defaultProps = { theme: Base };

export default StyledIconWrapper;
