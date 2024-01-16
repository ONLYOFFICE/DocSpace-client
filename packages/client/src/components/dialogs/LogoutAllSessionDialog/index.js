import { useState } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button } from "@docspace/shared/components/button";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";

import ModalDialogContainer from "../ModalDialogContainer";

const LogoutAllSessionDialog = ({
  t,
  visible,
  isLoading,
  onClose,
  onRemoveAllSessions,
  onRemoveAllExceptThis,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const onClick = () => {
    isChecked ? onRemoveAllSessions() : onRemoveAllExceptThis();
  };

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>
        {t("Profile:LogoutAllActiveConnections")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("Profile:LogoutDescription")}</Text>
        <Text style={{ margin: "15px 0" }}>
          {t("Profile:DescriptionForSecurity")}
        </Text>
        <Box displayProp="flex" alignItems="center">
          <Checkbox
            className="change-password"
            isChecked={isChecked}
            onChange={onChangeCheckbox}
          />
          {t("Profile:ChangePasswordAfterLoggingOut")}
        </Box>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="logout"
          key="LogoutBtn"
          label={t("Profile:LogoutBtn")}
          size="normal"
          scale
          primary={true}
          onClick={onClick}
          isLoading={isLoading}
        />
        <Button
          className="cancel-button"
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default LogoutAllSessionDialog;
