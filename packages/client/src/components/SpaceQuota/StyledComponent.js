import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";

const StyledBody = styled.div`
  overflow: hidden;
  width: 100%;
  max-width: max-content;

  display: flex;
  flex-wrap: nowrap;

  p {
    padding-top: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .combobobox-space-quota {
    flex: 1;
    min-width: 0;
    .combo-button {
      padding-left: 8px;
      padding-right: 0px;
      width: auto;
    }
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
