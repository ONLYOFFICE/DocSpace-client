import styled from "styled-components";
import { tablet } from "@docspace/shared/utils";
import { ModalDialog } from "@docspace/shared/components";
import { Base } from "@docspace/shared/themes";

const ModalDialogContainer = styled(ModalDialog)`
  .invite-link-dialog-wrapper {
    display: flex;

    @media ${tablet} {
      display: grid;
      grid-gap: 8px;
      grid-template-columns: auto;
    }
  }

  .text-dialog {
    margin: 16px 0;
  }

  .input-dialog {
    margin-top: 16px;
  }

  .warning-text {
    margin: 20px 0;
  }

  .textarea-dialog {
    margin-top: 12px;
  }

  .link-dialog {
    transition: opacity 0.2s;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 12px;`
        : `margin-right: 12px;`}
    opacity: ${(props) => (props.ChangeTextAnim ? 0 : 1)};
  }

  .error-label {
    position: absolute;
    max-width: 100%;
  }

  .field-body {
    position: relative;
  }

  .toggle-content-dialog {
    .heading-toggle-content {
      font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    }

    .modal-dialog-content {
      padding: 8px 16px;
      border: ${(props) => props.theme.client.about.border};

      .modal-dialog-checkbox:not(:last-child) {
        padding-bottom: 4px;
      }
    }
  }
`;

ModalDialogContainer.defaultProps = { theme: Base };

export default ModalDialogContainer;
