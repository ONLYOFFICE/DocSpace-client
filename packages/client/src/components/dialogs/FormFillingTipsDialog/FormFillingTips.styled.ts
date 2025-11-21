import styled from "styled-components";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

const StyledModalDialog = styled(ModalDialog)`
  #modal-dialog {
    width: 448px;
    height: auto;

    .modal-header {
      margin-top: 24px;
      margin-bottom: 8px;
      height: auto;
      min-height: auto;
      display: flex;
      align-items: baseline;

      .welcome-tips-header {
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        word-break: break-word;
      }

      :after {
        border: none;
      }
    }

    .modal-footer {
      margin-top: 8px;
      margin-bottom: 12px;
    }

    .icon-button {
      position: relative;
      right: -2px;
      bottom: 10px;
      width: 13px;
      height: 13px;
    }
    .welcome-tips-image {
      display: none;
    }
  }
`;

export { StyledModalDialog };
