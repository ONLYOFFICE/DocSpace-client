import styled from "styled-components";

import { mobile } from "@docspace/components/utils/device";
import { Base } from "@docspace/components/themes";

const StyledContainer = styled.div`
  width: 100%;
  max-width: 660px;

  display: flex;
  flex-direction: column;

  gap: 24px;

  .loader {
    rect {
      width: 100%;
    }
  }

  .scope-name-loader {
    margin-bottom: 4px;
  }

  .scope-desc-loader {
    margin-bottom: 2px;
  }
`;

const StyledBlock = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;

  .icon-field {
    margin: 0;
  }
`;

const StyledHeaderRow = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  gap: 4px;

  align-items: center;

  div {
    height: 12px;
  }
`;

const StyledInputBlock = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 16px;

  @media ${mobile} {
    display: flex;

    flex-direction: column;
  }
`;

const StyledInputGroup = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 4px;

  svg {
    cursor: pointer;
  }

  .pkce {
    margin-top: 4px;

    display: flex;
    align-items: center;
    gap: 0px;
  }

  .select {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin: 4px 0;

    .client-logo {
      max-width: 32px;
      max-height: 32px;
      width: 32px;
      height: 32px;

      border-radius: 3px;
    }

    p {
      color: ${(props) => props.theme.oauth.clientForm.descriptionColor};
    }
  }

  .description {
    color: ${(props) => props.theme.oauth.clientForm.descriptionColor};
  }

  .input-block-with-button {
    .field-body {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 8px;
    }
  }
`;

StyledInputGroup.defaultProps = { theme: Base };

const StyledInputRow = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 8px;

  input {
    user-select: none;
  }
`;

const StyledChipsContainer = styled.div`
  width: 100%;

  display: flex;
  flex-wrap: wrap;

  gap: 4px;
`;

const StyledScopesContainer = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: 1fr max-content max-content;

  align-items: center;

  gap: 16px 0;

  .header {
    padding-bottom: 8px;

    padding-right: 24px;
    margin-right: -12px;

    border-bottom: ${(props) => props.theme.oauth.clientForm.headerBorder};
  }

  .header-last {
    margin-right: 0px;
    padding-right: 0px;
  }

  .checkbox-read {
    margin-right: 12px;
  }
`;

StyledScopesContainer.defaultProps = { theme: Base };

const StyledScopesName = styled.div`
  display: flex;

  flex-direction: column;

  .scope-name {
    margin-bottom: 2px;
  }

  .scope-desc {
    color: ${(props) => props.theme.oauth.clientForm.scopeDesc};
  }
`;

StyledScopesName.defaultProps = { theme: Base };

const StyledScopesCheckbox = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: flex-start;
  justify-content: flex-end;

  .checkbox {
    margin-right: 0px;
  }
`;

const StyledButtonContainer = styled.div`
  width: fit-content;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 8px;

  @media ${mobile} {
    width: 100%;
  }
`;

export {
  StyledContainer,
  StyledBlock,
  StyledHeaderRow,
  StyledInputBlock,
  StyledInputGroup,
  StyledInputRow,
  StyledChipsContainer,
  StyledScopesContainer,
  StyledScopesName,
  StyledScopesCheckbox,
  StyledButtonContainer,
};
