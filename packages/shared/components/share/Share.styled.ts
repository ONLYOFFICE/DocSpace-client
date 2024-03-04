import styled from "styled-components";

const StyledLinks = styled.div`
  margin-top: 20px;

  .title-link {
    margin-bottom: 12px;
    line-height: 16px;
    color: #a3a9ae;
  }

  .additional-link {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    .link-to-viewing-icon {
      svg {
        weight: 16px;
        height: 16px;
      }
    }
  }
`;

const StyledLinkRow = styled.div`
  padding: 8px 0;
  display: flex;
  gap: 8px;
  align-items: center;

  .combo-box {
    padding: 0;
  }

  .combo-button {
    padding-left: 8px;
  }

  .link-options {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .internal-combobox {
    padding: 0px;
  }

  .expired-options {
    padding: 0px;

    & > span > a {
      padding: 0px !important;
    }
  }

  .expire-text {
    margin-left: 8px;
  }

  .link-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-left: auto;
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${(props) => props.theme.avatar.imageContainer.borderRadius};
    background-color: ${(props) => props.theme.avatar.icon.background};
    height: 32px;
    width: 32px;
  }
`;

const StyledSquare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  padding: 10px;
  background: ${(props) => props.theme.avatar.icon.background};
`;

export { StyledLinks, StyledLinkRow, StyledSquare };
