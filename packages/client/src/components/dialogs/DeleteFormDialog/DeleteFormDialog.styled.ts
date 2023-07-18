import styled from "styled-components";

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  user-select: none;
  /* align-items: center; */
`;

export const TooltipWrapper = styled.div`
  margin-left: 4px;
`;

export const StyledTooltip = styled.div`
  .subtitle {
    margin-bottom: 10px;
  }
`;
