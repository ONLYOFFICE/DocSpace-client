import styled from "styled-components";
import { Base } from "../../../themes";

export const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  & > span {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  }
`;

SelectWrapper.defaultProps = { theme: Base };
