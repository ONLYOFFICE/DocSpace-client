import React, { useEffect } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const StyledBodyText = styled.div`
  line-height: 20px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;

  button {
    width: 100%;
  }
  button:first-of-type {
    margin-right: 10px;
  }
`;

const DeleteDialog = ({
  visible,
  onClose,
  header,
  handleSubmit,
  currentClient,
}) => {
  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  const { t } = useTranslation(["Common", "EmptyTrashDialog"]);

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return () => window.removeEventListener("keyup", onKeyPress);
  });

  const handleDeleteClick = () => {
    handleSubmit(currentClient.id);
    onClose();
  };

  return (
    <ModalDialog visible={visible} onClose={onClose} displayType="modal">
      <ModalDialog.Header>{`Delete profile`}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyText>{`Do you want to delete profile: ${currentClient.name}`}</StyledBodyText>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Footer>
          <Button
            label={t("Common:Delete")}
            size="normal"
            primary={true}
            onClick={handleDeleteClick}
          />
          <Button
            label={t("Common:CancelButton")}
            size="normal"
            onClick={onClose}
          />
        </Footer>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DeleteDialog;
