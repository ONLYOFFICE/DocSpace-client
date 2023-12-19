import styled from "styled-components";
import Base from "../../themes/base";

export const Container = styled.div`
  box-sizing: border-box;
  width: ${(props) => (props.isMobile ? "100%" : "362px")};
  height: ${(props) => (props.isMobile ? "420px" : "376px")};
  padding: ${(props) => (props.isMobile ? "16px" : "30px 28px 28px 28px")};
  box-shadow: ${(props) => props.theme.calendar.boxShadow};
  border-radius: 6px;
  z-index: 320;
  background-color: ${(props) => props.theme.backgroundColor};
`;

Container.defaultProps = { theme: Base };
