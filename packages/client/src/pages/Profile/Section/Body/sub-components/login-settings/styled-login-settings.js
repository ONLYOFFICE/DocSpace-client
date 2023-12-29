import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";

export const StyledWrapper = styled.div`
  max-width: 660px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .actions {
    display: flex;
    gap: 16px;
    align-items: center;

    @media ${mobile} {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .button {
        width: 100%;
        height: 40px;
        font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      }
    }
  }
`;
