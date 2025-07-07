import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

export const StyledModalDialog = styled(ModalDialog)`
  #modal-dialog {
    width: 520px;
    max-height: fit-content;

    .modal-body {
      padding-bottom: 0px;
    }

    @media ${mobile} {
      .modal-header {
        margin-bottom: 0px;
      }
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
    margin: 16px 0;
    border-radius: 6px;
    background-color: ${(props) =>
      props.theme.socialAuthDialog.accountDetailsBackground};
    padding: 12px 0px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .welcome-text {
      width: 100%;
      line-height: 20px;
    }

    & > .no-gap {
      margin-top: -8px;
    }

    .paid-badge {
      margin-left: 4px;
    }
  }

  .change-data-link {
    margin-top: 16px;
    text-align: center;
  }

  .change-domain_link,
  .change-profile_link {
    color: ${(props) => props.theme.currentColorScheme?.main.accent};
  }

  @media ${mobile} {
    .account-details {
      width: 100%;
      padding: 12px 8px;
    }
    .welcome-image {
      margin-bottom: 16px;
    }

    .welcome-auth-social-image {
      height: 160px;
    }
  }
`;

export const StyledInfoRow = styled.div`
  display: flex;
  align-items: baseline;
  padding: 4px 16px;
  height: 28px;
  max-height: 28px;
  box-sizing: border-box;

  & > .welcome-text:first-child {
    width: 156px;
    min-width: 156px;
    flex-shrink: 0;
  }
`;
