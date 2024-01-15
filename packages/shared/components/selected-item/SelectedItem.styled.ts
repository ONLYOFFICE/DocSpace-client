import styled, { css } from "styled-components";

import { NoUserSelect } from "../../utils";
import { Base } from "../../themes";

const StyledSelectedItem = styled.div<{
  isInline?: boolean;
  isDisabled?: boolean;
}>`
  width: ${(props) => (props.isInline ? "fit-content" : "100%")};
  height: 32px;

  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  box-sizing: border-box;

  border-radius: 3px;

  padding: 6px 8px;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: 4px;`
      : `margin-right: 4px;`}
  margin-bottom: 4px;

  background: ${(props) => props.theme.filterInput.selectedItems.background};

  ${(props) =>
    !props.isDisabled &&
    css`
      :hover {
        background: ${props.theme.filterInput.selectedItems.hoverBackground};
      }
    `}
`;

const StyledLabel = styled.div<{ isDisabled?: boolean; truncate?: boolean }>`
  line-height: 20px;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: 10px;`
      : `margin-right: 10px;`}
  max-width: 23ch;
  color: ${(props) => props.isDisabled && props.theme.text.disableColor};

  ${NoUserSelect}

  ${(props) =>
    props.truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

StyledSelectedItem.defaultProps = { theme: Base };

export { StyledSelectedItem, StyledLabel };
