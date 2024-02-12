import styled from "styled-components";
import { animated } from "@react-spring/web";
import { isDesktop } from "react-device-detect";

export const Wrapper = styled(animated.section)`
  width: 100%;
  height: ${`calc(100vh - ${isDesktop ? "85" : "66"}px)`};
  margin-top: ${isDesktop ? "85px" : "66px"};
  touch-action: none;
`;

export const Content = styled.div<{ isLoading: boolean }>`
  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};
`;
