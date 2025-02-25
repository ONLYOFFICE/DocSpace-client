import styled from "styled-components";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

const StyledModalDialog = styled(ModalDialog)`
  #modal-dialog {
    width: 448px;
    height: 374px;

    .modal-header {
      margin-top: 16px;
      margin-bottom: 0px;
      height: 38px;
      min-height: 38px;
      :after {
        border: none;
      }
    }

    .modal-footer {
      margin-top: 3px;
    }

    .icon-button {
      position: relative;
      right: -2px;
      bottom: 10px;
      width: 13px;
      height: 13px;
    }
  }
`;

export { StyledModalDialog };
