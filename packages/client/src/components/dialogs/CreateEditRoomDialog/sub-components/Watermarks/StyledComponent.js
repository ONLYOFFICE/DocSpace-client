import styled from "styled-components";

const StyledWatermark = styled.div`
  margin-top: 16px;
  display: grid;
  grid-gap: 24px;
  grid-template-columns: minmax(214px, 324px) 1fr;

  .watermark-title {
    margin: 16px 0 4px 0;
  }
  .watermark-checkbox {
    margin: 18px 0 0 0;
  }
`;
const StyledBody = styled.div`
  .types-content {
  }
`;

export { StyledWatermark, StyledBody };
