import styled, { css } from "styled-components";
import Text from "@docspace/components/text";

const StyledText = styled(Text)`
  display: inline-block;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 12px;
        `
      : css`
          margin-right: 12px;
        `}
`;

const StyledTypeCell = styled(StyledText)`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" &&
    css`
      display: flex;
      justify-content: flex-start;

      span {
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .type {
        flex-shrink: 0;
        flex-grow: 1;
        flex-basis: 0;
      }

      .extension {
        flex-shrink: 1;
        flex-grow: 0;
      }
    `}
`;

const StyledAuthorCell = styled.div`
  display: flex;
  width: 100%;
  overflow: hidden;

  .author-avatar-cell {
    width: 16px;
    min-width: 16px;
    height: 16px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }
`;

export { StyledText, StyledAuthorCell, StyledTypeCell };
