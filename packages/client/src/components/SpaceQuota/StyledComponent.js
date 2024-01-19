import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";

const StyledBody = styled.div`
  overflow: hidden;
  width: 100%;
  max-width: max-content;

  display: flex;
  p {
    padding-top: 8px;
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

  padding-top: ${(props) =>
    props.withoutLimitQuota || props.isReadOnly ? "0px" : "8px"};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export { StyledText, StyledBody };
