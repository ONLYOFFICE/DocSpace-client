import React from "react";
import ModalDialogContainer from "../ModalDialogContainer";
import styled from "styled-components";

export const ChangeNameContainer = styled(ModalDialogContainer)`
  #modal-dialog {
    max-height: none;
  }

  .error-label {
    position: relative;
  }
`;
