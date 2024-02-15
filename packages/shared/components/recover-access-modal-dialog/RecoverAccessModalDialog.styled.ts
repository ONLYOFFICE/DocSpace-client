import styled from "styled-components";

import { mobile, tablet } from "@docspace/shared/utils";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";

export const ModalDialogContainer = styled(ModalDialog)`
  .modal-dialog-aside-footer {
    @media ${tablet} {
      width: 90%;
    }
  }

  .recover-button-dialog {
    @media ${mobile} {
      width: 100%;
    }
  }

  .text-body {
    margin-bottom: 16px;
  }

  .textarea {
    margin-bottom: 0;
  }
`;
