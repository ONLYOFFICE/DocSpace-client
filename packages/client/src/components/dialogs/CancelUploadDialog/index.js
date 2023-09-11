import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import ModalDialogContainer from "../ModalDialogContainer";

const CancelUploadDialog = ({ isFifthStep, visible, onClose, loading }) => {
  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();

  const modalBodyText = isFifthStep
    ? t("Settings:WantToCancelDataImport")
    : t("Settings:WantToCancelUpload");

  const onCancelProcess = () => {
    if (isFifthStep) {
      navigate("/portal-settings/data-import/migration");
    } else {
      onClose();
    }
  };

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("Common:Confirmation")}</ModalDialog.Header>
      <ModalDialog.Body>{modalBodyText}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:Yes")}
          size="normal"
          scale
          primary={true}
          onClick={onCancelProcess}
          isLoading={loading}
        />
        <Button
          label={t("Common:No")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={loading}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default CancelUploadDialog;
