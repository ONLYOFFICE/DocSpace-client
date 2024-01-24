import styled from "styled-components";
import { mobile } from "../../utils";
import { Base } from "../../themes";

export const CronWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 340px;

  @media ${mobile} {
    max-width: 100%;
  }
`;

export const Suffix = styled.span`
  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  line-height: 20px;
  font-weight: 400;
`;

Suffix.defaultProps = { theme: Base };

export const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  & > span {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  }
`;

SelectWrapper.defaultProps = { theme: Base };

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  gap: 8px;

  width: 100%;

  > div {
    flex-grow: 1;
  }
`;
