import styled from "styled-components";
import { ViewerLoaderProps } from "./ViewerLoader.types";

export const StyledLoaderWrapper = styled.div<
  Pick<ViewerLoaderProps, "withBackground">
>`
  position: fixed;
  inset: 0;

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => props.withBackground && "background-color: rgba(0, 0, 0, 0.4);"}
`;

export const StyledLoader = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
