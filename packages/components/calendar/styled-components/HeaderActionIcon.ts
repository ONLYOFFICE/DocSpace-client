import styled from "styled-components";
import { ArrowIcon } from "./ArrowIcon";
import Base from "../../themes/base";

export const HeaderActionIcon = styled(ArrowIcon)`
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  width: ${(props) => (props.isMobile ? "5px" : "6px")};
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  height: ${(props) => (props.isMobile ? "5px" : "6px")};
  transform: rotate(225deg);
  // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
  top: ${(props) => (props.isMobile ? "11px" : "8.5px")};
  left: 104%;
  border-color: ${(props) => props.theme.calendar.accent};
`;

HeaderActionIcon.defaultProps = { theme: Base };
