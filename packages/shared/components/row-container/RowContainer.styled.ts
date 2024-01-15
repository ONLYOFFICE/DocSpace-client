import styled from "styled-components";

const StyledRowContainer = styled.div<{
  useReactWindow?: boolean;
  manualHeight?: string;
}>`
  user-select: none;
  height: ${(props) =>
    props.useReactWindow
      ? props.manualHeight
        ? props.manualHeight
        : "100%"
      : "auto"};
  position: relative;
`;

export default StyledRowContainer;
