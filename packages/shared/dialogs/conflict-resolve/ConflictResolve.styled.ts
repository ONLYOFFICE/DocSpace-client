import styled from "styled-components";

import { ModalDialog } from "../../components/modal-dialog";

const StyledModalDialog = styled(ModalDialog)`
  .radio {
    padding-bottom: 8px;
  }

  .message {
    margin-bottom: 16px;

    .bold {
      font-weight: 600;
    }
  }

  .select-action {
    margin-bottom: 12px;
  }

  .conflict-resolve-radio-button {
    label {
      display: flex;
      align-items: flex-start;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    svg {
      overflow: visible;

      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-left: 8px;`
          : `margin-right: 8px;`}
      margin-top: 3px;
    }

    .radio-option-title {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      line-height: 16px;
    }

    .radio-option-description {
      font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
      line-height: 16px;
      color: #a3a9ae;
    }
  }
`;

export default StyledModalDialog;
