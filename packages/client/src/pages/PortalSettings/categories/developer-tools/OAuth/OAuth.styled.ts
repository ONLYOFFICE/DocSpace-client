import styled from "styled-components";

import { injectDefaultTheme } from "@docspace/shared/utils";

export const OAuthContainer = styled.div`
  width: 100%;

  .ec-subheading {
    margin-top: 8px;
    text-align: center;
  }
`;

export const StyledContainer = styled.div`
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 20px;

  padding-top: 16px;
`;

export const StyledPreviewContainer = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  height: 152px;

  box-sizing: border-box;

  border: ${(props) => props.theme.oauth.previewDialog.border};

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  .social-button {
    max-width: fit-content;

    padding: 11px 16px;

    box-sizing: border-box;

    display: flex;
    gap: 16px;

    .iconWrapper {
      padding: 0;
      margin: 0;
    }
  }
`;

export const StyledBlocksContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;

  .block-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

export const StyledInfoContainer = styled.div.attrs(injectDefaultTheme)<{
  showDescription: boolean;
  withShowText: boolean;
}>`
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  padding-top: 16px;

  display: flex;
  flex-direction: column;

  .client-block {
    width: 100%;
    height: 32px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;

    .client-block__info {
      width: 100%;

      display: flex;
      flex-direction: row;
      align-items: center;

      gap: 8px;

      .client-block__info-logo {
        width: 32px;
        height: 32px;

        max-width: 32px;
        max-height: 32px;

        border-radius: 3px;
      }
    }
  }

  .description {
    max-height: ${(props) =>
      props.showDescription ? "100%" : props.withShowText ? "100px" : "100%"};

    overflow: hidden;

    margin-bottom: ${(props) => (props.withShowText ? "4px" : 0)};
  }

  .desc-link {
    color: ${(props) => props.theme.oauth.infoDialog.descLinkColor};
  }

  .block-header {
    margin-top: 20px;
    margin-bottom: 12px;

    color: ${(props) => props.theme.oauth.infoDialog.blockHeaderColor};
  }

  .creator-block {
    margin: 8px 0;

    display: flex;
    flex-direction: row;
    align-items: center;

    gap: 8px;
  }

  .privacy-block {
    display: flex;

    .separator {
      display: inline-block;

      margin-top: 2px;

      height: 16px;
      width: 1px;

      margin: 0 8px;

      background: ${(props) => props.theme.oauth.infoDialog.separatorColor};
    }
  }

  .property-tag_list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .property-tag {
      max-width: 195px;
      margin: 0;
      background: ${(props) => props.theme.infoPanel.details.tagBackground};
      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`;

export const StyledGenerateDevelopTokenContainer = styled.div`
  .dates {
    margin-top: 16px;
    margin-bottom: 0;
  }
`;
