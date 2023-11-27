import styled from "styled-components";
import Base from "../../themes/base";

export const Container = styled.div`
  box-sizing: border-box;
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  width: ${(props) => (props.isMobile ? "100%" : "362px")};
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  height: ${(props) => (props.isMobile ? "420px" : "376px")};
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  padding: ${(props) => (props.isMobile ? "16px" : "30px 28px 28px 28px")};
  box-shadow: ${(props) => props.theme.calendar.boxShadow};
  border-radius: 6px;
  z-index: 320;
  background-color: ${(props) => props.theme.backgroundColor};
`;

Container.defaultProps = { theme: Base };
