import styled from "styled-components";
import { tablet } from "@docspace/shared/utils";
import { ModalDialog } from "@docspace/shared/components";

const ModalDialogContainer = styled(ModalDialog)`
  .modal-dialog-aside-footer {
    @media ${tablet} {
      width: 90%;
    }
  }
  .modal-dialog-button {
    @media ${tablet} {
      width: 100%;
    }
  }
  .field-body {
    margin-top: 16px;
  }
`;

export default ModalDialogContainer;
