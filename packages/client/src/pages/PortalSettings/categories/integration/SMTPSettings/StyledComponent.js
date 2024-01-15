import styled, { css } from "styled-components";

import { mobile } from "@docspace/shared/utils";

const StyledComponent = styled.div`
  max-width: 700px;

  .smtp-settings_description {
    margin-bottom: 8px;
    max-width: 700px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    line-height: 20px;
  }

  .smtp-settings_main-title {
    .link-learn-more {
      display: inline-block;
      margin-bottom: 20px;
      font-weight: 600;
    }
  }
  .smtp-settings_title {
    display: flex;

    span {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 2px;
            `
          : css`
              margin-left: 2px;
            `}
    }
  }
  .smtp-settings_input {
    margin-bottom: 16px;
    margin-top: 4px;
    max-width: 350px;

    @media ${mobile} {
      max-width: 100%;
    }

    .field-label-icon {
      display: none;
    }
  }
  .smtp-settings_auth {
    margin: 24px 0;

    .smtp-settings_login {
      margin-top: 16px;
    }
    .smtp-settings_toggle {
      position: static;
    }
  }

  .smtp_settings_checkbox {
    width: fit-content;
  }
`;

const ButtonStyledComponent = styled.div`
  margin-top: 20px;

  display: flex;
  gap: 8px;

  @media ${mobile} {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
  }
`;
export { StyledComponent, ButtonStyledComponent };
