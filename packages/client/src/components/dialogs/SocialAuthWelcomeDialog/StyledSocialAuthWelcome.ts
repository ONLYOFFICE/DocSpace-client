import styled from "styled-components";
import { tablet } from "@docspace/shared/utils";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

export const StyledModalDialog = styled(ModalDialog)`
  #modal-dialog {
    width: 520px;
    max-height: fit-content;

    .modal-body {
      padding-bottom: 0px;
    }
  }

  .auth-social-button {
    margin: 0 auto;
  }
`;

export const StyledBodyContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 8px;

  .welcome-image {
    margin-bottom: 22px;
    text-align: center;
  }

  .welcome-title {
    margin-bottom: 8px;
  }

  .account-details {
    width: 488px;
    margin: 12px 0;
    border-radius: 6px;
    background-color: ${(props) =>
      props.theme.socialAuthDialog.accountDetailsBackground};
    padding: 16px 0px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    p {
      line-height: 20px;
    }

    & > div.no-gap {
      margin-top: -8px;
    }
  }

  .change-data-link {
    margin-top: 16px;
    text-align: center;
  }

  a {
    color: ${(props) => props.theme.currentColorScheme?.main.accent};
  }

  @media ${tablet} {
    .account-details {
      padding: 12px;
    }
  }
`;

export const StyledInfoRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1px 16px;
  height: 28px;
  max-height: 28px;
  box-sizing: border-box;

  & > p:first-child {
    width: 156px;
    min-width: 156px;
    flex-shrink: 0;
  }

  .info-value {
    max-width: 300px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
`;
