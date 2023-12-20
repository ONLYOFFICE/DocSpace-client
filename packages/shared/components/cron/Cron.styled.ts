import styled from "styled-components";
import { Base } from "../../themes";

export const CronWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const Suffix = styled.span`
  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  line-height: 20px;
  font-weight: 400;
`;

Suffix.defaultProps = { theme: Base };
