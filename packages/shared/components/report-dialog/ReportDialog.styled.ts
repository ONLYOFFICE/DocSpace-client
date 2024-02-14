import styled from "styled-components";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";

export const ModalDialogContainer = styled(ModalDialog)`
  #modal-dialog {
    width: auto;
    max-width: 520px;
    max-height: 560px;
  }

  .report-description {
    margin-bottom: 16px;
  }

  .report-wrapper {
    margin-top: 8px;
    height: 48px;
    display: flex;
    gap: 16px;
    align-items: center;

    .report-filename {
      display: flex;
    }

    .file-icon {
      width: 24px;
      user-select: none;
    }

    .icon-button {
      cursor: pointer;
    }
  }
`;
