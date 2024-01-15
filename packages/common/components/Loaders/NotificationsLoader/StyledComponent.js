import styled from "styled-components";
import { tablet } from "@docspace/shared/utils";

const StyledComponent = styled.div`
  display: grid;
  grid-template-columns: 1fr 24px;
  max-width: 660px;
  grid-gap: 24px;

  .notifications_title-loader {
    max-width: 133px;
    display: block;
    margin-bottom: 2px;
  }
  .notifications_content-loader {
    max-width: 540px;
  }
  margin-bottom: 24px;
`;

export { StyledComponent };
