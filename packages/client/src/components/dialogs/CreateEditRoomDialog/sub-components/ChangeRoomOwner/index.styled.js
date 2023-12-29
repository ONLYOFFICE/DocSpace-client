import { Base } from "@docspace/shared/themes";
import styled from "styled-components";

export const ChangeRoomOwner = styled.div`
  .change-owner-display {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;

    .change-owner-display-name {
      display: flex;
      align-items: center;
      gap: 4px;

      .me-label {
        color: ${({ theme }) => theme.text.disableColor};
      }
    }
  }
`;

ChangeRoomOwner.defaultProps = { theme: Base };
