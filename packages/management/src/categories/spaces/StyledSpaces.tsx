import styled, { css } from "styled-components";
import { isMobileOnly } from "react-device-detect"

const SpaceContainer = styled.div`
  max-width: 700px;

  .spaces {
    &-input-block {
      margin-bottom: 18px;
    }
    &-text-wrapper {
      display: flex;
    }
    &-input {
      margin-top: 4px;
      width: 350px;
      height: 32px;
    }
    &-header {
      margin-bottom: 20px;
    }
  }

  .row-content_tablet-side-info {
    font-size: 12px;
  }

  @media (max-width: 600px) {
    .row-content_tablet-side-info {
      display: none;
    }

    .spaces-button,
    .spaces-input {
      width: 100%;
    }
  }
`;

const ConfigurationWrapper = styled.div`
  max-width: 700px;

  .spaces {
    &-configuration-header {
      margin-bottom: 20px;
    }
    &-domain-text {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-left: 2px;`
          : `padding-right: 2px;`}
    }
    &-configuration-title {
      padding-bottom: 8px;
    }
  }
`;

const StyledMultipleSpaces = styled.div`
  .domain-settings-wrapper {
    padding-top: 22px;
  }

  .spaces {
    &-input-block {
      margin-top: 16px;
    }
    &-input-subheader {
      padding-bottom: 3px;
    }
  }
`;


const StyledLoader = styled.div`
  max-width: 700px;
  display: flex;
  flex-direction: column;

  .button {
    margin: 20px 0;
    max-width: 100px;
    ${isMobileOnly &&
    css`
      max-width: 100%;
    `}
  }

  .portals {
    margin-bottom: 24px;
  }

  .domain-header {
    max-width: 130px;
    margin-bottom: 16px;
  }

  .configuration-header {
    max-width: 225px;
    margin-top: 20px;
    margin-bottom: 8px;
  }

  .input {
    max-width: 350px;
  }

  .configuration-input {
    max-width: 350px;
    margin-top: 16px;
  }
`;

export { SpaceContainer, ConfigurationWrapper, StyledMultipleSpaces, StyledLoader };
