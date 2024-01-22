import { useState } from "react";
import { inject, observer } from "mobx-react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";

import ModalDialogContainer from "../ModalDialogContainer";

const LogoutAllSessionDialog = ({
  t,
  data,
  visible,
  isLoading,
  onClose,
  onRemoveAllSessions,
  onRemoveAllExceptThis,
  isSeveralSelection,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const onClick = () => {
    isChecked ? onRemoveAllSessions() : onRemoveAllExceptThis();
  };

  const isProfile = location.pathname.includes("/profile");

  const bodySubtitle =
    isSeveralSelection || isProfile
      ? t("Profile:LogoutDescription")
      : t("Profile:LogoutCurrentUserDescription", {
          displayName: data?.displayName,
        });

  const bodyText = !isSeveralSelection && (
    <>
      <Text style={{ margin: "15px 0px" }}>
        {t("Profile:DescriptionForSecurity")}
      </Text>
      <Checkbox
        style={{ display: "inline-flex" }}
        label={t("Profile:ChangePasswordAfterLoggingOut")}
        isChecked={isChecked}
        onChange={onChangeCheckbox}
      />
    </>
  );

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
        {bodySubtitle}
        {bodyText}
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

export default inject(({ peopleStore }) => {
  const { isSeveralSelection } = peopleStore.selectionStore;

  return {
    isSeveralSelection,
  };
})(observer(LogoutAllSessionDialog));
