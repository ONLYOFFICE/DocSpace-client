import styled from "styled-components";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { tablet } from "@docspace/shared/utils";

const ModalDialogContainer = styled(ModalDialog)`
  .modal-dialog-aside {
    padding: 0;
  }

  .modal-dialog-aside-body {
    padding: 0;
    margin: 0;
  }

  .modal-dialog-aside-footer {
    @media ${tablet} {
      width: 90%;
    }
  }
  .modal-dialog-button {
    display: inline-block;
  }
  .field-body {
    margin-top: 16px;
  }

  .email-reg-field {
    margin: 0;
  }
`;

export default ModalDialogContainer;
