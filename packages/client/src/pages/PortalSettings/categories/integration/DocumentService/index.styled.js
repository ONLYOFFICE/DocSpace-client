import { mobile } from "@docspace/components/utils/device";
import styled from "styled-components";

export const Location = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const LocationHeader = styled.div`
  .main {
    width: 100%;
    max-width: 700px;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 400;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    line-height: 20px;
    margin-bottom: 8px;
  }

  .third-party-link {
    display: inline-block;
    font-weight: 600;
  }
`;

export const LocationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .form-inputs {
    width: 100%;
    max-width: 350px;

    @media ${mobile} {
      max-width: 100%;
    }

    display: flex;
    flex-direction: column;
    gap: 16px;

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .icon-button {
        display: none;
      }
    }

    .subtitle {
      color: ${(props) => props.theme.client.settings.common.descriptionColor};
    }
  }

  .form-buttons {
    display: flex;
    flex-direction: row;
    gap: 8px;

    @media ${mobile} {
      .button {
        width: 100%;
      }
    }
  }
`;
