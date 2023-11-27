import { Base } from "../themes";
import styled, { css } from "styled-components";

import NoUserSelect from "../utils/commonStyles";

const StyledSelectedItem = styled.div`
  // @ts-expect-error TS(2339): Property 'isInline' does not exist on type 'Themed... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    !props.isDisabled &&
    css`
      :hover {
        background: ${(props) =>
          props.theme.filterInput.selectedItems.hoverBackground};
      }
    `}
`;

const StyledLabel = styled.div`
  line-height: 20px;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: 10px;`
      : `margin-right: 10px;`}
  max-width: 23ch;
  // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
  color: ${(props) => props.isDisabled && props.theme.text.disableColor};

  ${() => NoUserSelect}

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'truncate' does not exist on type 'Themed... Remove this comment to see the full error message
    props.truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

StyledSelectedItem.defaultProps = { theme: Base };

export { StyledSelectedItem, StyledLabel };
