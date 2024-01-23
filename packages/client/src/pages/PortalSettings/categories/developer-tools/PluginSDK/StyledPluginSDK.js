import styled from "styled-components";

import { mobile } from "@docspace/components/utils/device";

export const StyledContainer = styled.div`
  width: 100%;
  max-width: 700px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  .read-instructions-button {
     {
      width: fit-content;

      @media ${mobile} {
        width: 100%;
      }
      margin-bottom: 8px;
    }
  }

  .description {
    color: ${(props) => props.theme.plugins.descriptionColor};
  }

  .plugin-list {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(328px, 1fr));

    gap: 16px;

    .plugin-list__item {
      width: 100%;
      max-height: 164px;

      padding: 12px 16px;

      box-sizing: border-box;

      display: flex;
      flex-direction: column;
      gap: 12px;

      border: 1px solid ${(props) => props.theme.plugins.borderColor};
      border-radius: 6px;
      .plugin-list__item-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;

        .plugin-logo {
          width: 44px;
          height: 44px;
        }

        .plugin-info-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
      }
      .description-text {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }
  }
`;
