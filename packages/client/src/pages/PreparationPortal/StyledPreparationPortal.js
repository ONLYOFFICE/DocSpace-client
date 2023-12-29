import styled from "styled-components";
import { tablet } from "@docspace/shared/utils";

const StyledPreparationPortal = styled.div`
  width: 100%;
  @media ${tablet} {
    margin-top: ${(props) => (props.isDialog ? "0px" : "48px")};
  }

  #header {
    font-size: ${(props) => props.theme.getCorrectFontSize("23px")};
  }
  #text {
    color: #a3a9ae;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: 20px;
    max-width: 480px;
  }

  .preparation-portal_body-wrapper {
    margin-bottom: 24px;
    width: 100%;
    max-width: ${(props) => (props.errorMessage ? "560px" : "480px")};
    box-sizing: border-box;
    align-items: center;
    .preparation-portal_error {
      text-align: center;
      color: ${(props) => props.theme.preparationPortalProgress.errorTextColor};
    }

    .preparation-portal_text {
      text-align: center;
      color: ${(props) =>
        props.theme.preparationPortalProgress.descriptionTextColor};
    }
  }
`;

export { StyledPreparationPortal };
