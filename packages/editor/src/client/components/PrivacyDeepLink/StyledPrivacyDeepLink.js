import styled, { css } from "styled-components";

import { mobile, tablet } from "@docspace/components/utils/device";
import { Base } from "@docspace/components/themes";

const StyledDeepLinkWrapper = styled.div`
  width: 100%;
  height: 100vh;
  padding-top: 100px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-direction: column;
  // background-image: ${(props) => props.bgPattern};
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: 100% 100%;
  .deep-link__logo {
    max-height: 44px;
    cursor: pointer;
    margin-bottom: 64px;
    svg {
      path:last-child {
        // fill: ${(props) => props.theme.client.home.logoColor};
      }
    }
  }
  .deep-link__header {
    font-size: 23px;
    font-weight: 700;
    line-height: 28px;
    margin: 0;
    margin-bottom: 16px;
  }
  .deep-link__description {
    width: 386px;
    max-width: calc(100% - 32px);
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
    margin-bottom: 32px;
  }
  @media ${tablet} {
    background-size: cover;
  }
  @media ${mobile} {
    background-image: none;
  }
`;

StyledDeepLinkWrapper.defaultProps = { theme: Base };

const StyledContentContainer = styled.div`
  width: 386px;
  max-width: calc(100% - 32px);
  padding: 32px;
  // box-shadow: ${(props) => props.theme.deepLinkPage.boxShadow};
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-direction: column;
  // background: ${(props) => props.theme.backgroundColor};

  .deep-link-content__description {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
  }
  .deep-link-content__button {
    margin-top: 32px;
    margin-bottom: 24px;
  }
  .deep-link-content__without-app {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
    margin-bottom: 8px;
  }
  .deep-link-content__download-now {
    font-weight: 600;
    font-size: 13px;
    line-height: 15px;
  }
  .deep-link-content__mobile-header {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    margin-bottom: 8px;
  }
  .deep-link-content__mobile-description {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    text-align: left;
  }
`;

StyledContentContainer.defaultProps = { theme: Base };

export { StyledDeepLinkWrapper, StyledContentContainer };
