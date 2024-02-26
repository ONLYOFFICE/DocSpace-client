import styled, { css } from "styled-components";

import { Base } from "../../themes";

const StyledSocialButtonsGroup = styled.div`
  width: 100%;

  .sso-button {
    margin-bottom: 8px;
  }

  .social-button {
    box-shadow: none;
    border: ${(props) => props.theme.socialButtonsGroup.border};
    border-radius: ${(props) => props.theme.socialButton.borderRadius};
  }
  .social-buttons-group {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 8px;

    .buttonWrapper {
      margin-bottom: 8px;
      width: 100%;
    }

    .show-more-button {
      padding: 10px 16px;
      border-radius: ${(props) => props.theme.socialButton.borderRadius};
      border: ${(props) => props.theme.socialButtonsGroup.border};

      width: 52px;
      height: 40px;
      box-sizing: border-box;
      .icon-button_svg {
        transform: rotate(90deg);
      }
    }
  }
`;

StyledSocialButtonsGroup.defaultProps = { theme: Base };

export default StyledSocialButtonsGroup;
