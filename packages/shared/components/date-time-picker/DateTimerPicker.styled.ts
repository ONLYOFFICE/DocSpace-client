import styled, { css } from "styled-components";
import { getCorrectFourValuesStyle } from "../../utils";
import { Base } from "../../themes";

const Selectors = styled.div<{ hasError?: boolean }>`
  position: relative;
  margin-top: 8px;
  margin-bottom: 16px;
  height: 32px;
  display: flex;
  align-items: center;

  .selectedItem {
    margin-bottom: 0;
    cursor: pointer;
    ${(props) =>
      props.hasError &&
      css`
        color: red;
      `}
  }
`;

const TimeCell = styled.span<{ hasError?: boolean }>`
  display: flex;
  align-items: center;

  box-sizing: border-box;

  width: 73px;
  height: 32px;

  background-color: ${(props) => (props.theme.isBase ? "#eceef1" : "#242424")};
  border-radius: 3px;

  padding: 6px 8px;

  cursor: pointer;

  .clockIcon {
    width: 12px;
    height: 12px;
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("0 10px 0 2px", theme.interfaceDirection)};
  }

  ${(props) =>
    props.hasError &&
    css`
      color: red;
    `}
`;

TimeCell.defaultProps = { theme: Base };

const TimeSelector = styled.span`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-right: 4px;`
      : `margin-left: 4px;`}
  display: inline-flex;
  align-items: center;
`;

TimeSelector.defaultProps = { theme: Base };

export { TimeSelector, TimeCell, Selectors };
