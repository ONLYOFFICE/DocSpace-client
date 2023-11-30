import styled, { css } from "styled-components";
import Text from "@docspace/components/text";

const StyledBody = styled.div`
  overflow: hidden;
  width: 100%;
  max-width: max-content;

  display: flex;
  p {
    padding-top: 8px;
    padding-right: 5px;
  }

  .combo-button {
    padding-left: 8px;
    padding-right: 0px;
  }
`;

const StyledText = styled(Text)`
  overflow: hidden;
  width: 100%;
  max-width: max-content;

  padding-top: 8px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export { StyledText, StyledBody };
