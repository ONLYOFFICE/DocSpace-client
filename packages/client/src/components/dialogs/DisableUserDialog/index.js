import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { EmployeeStatus } from "@docspace/shared/enums";

import ModalDialogContainer from "../ModalDialogContainer";

const DisableUserDialog = ({
  t,
  visible,
  onClose,
  userIds,
  isLoading,
  fetchData,
  updateUserStatus,
  clearSelection,
}) => {
  const onlyOneUser = userIds.length === 1;

  let headerText = "";
  let bodyText = "";

  headerText = onlyOneUser
    ? t("ChangeUserStatusDialog:DisableUser")
    : t("ChangeUserStatusDialog:DisableUsers");

  bodyText = onlyOneUser
    ? t("ChangeUserStatusDialog:DisableUserDescription")
    : t("ChangeUserStatusDialog:DisableUsersDescription");

  bodyText = bodyText + t("ChangeUserStatusDialog:DisableGeneralDescription");

  const onClickDisableUser = async () => {
    try {
      await updateUserStatus(EmployeeStatus.Disabled, userIds);
      await fetchData();
      toastr.success(t("PeopleTranslations:SuccessChangeUserStatus"));
    } catch (error) {
      toastr.error(error);
    } finally {
      clearSelection();
      onClose();
    }
  };

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{headerText}</ModalDialog.Header>
      <ModalDialog.Body>{bodyText}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="DisableBtn"
          label={t("Common:DisableUserButton")}
          size="normal"
          scale
          primary={true}
          onClick={onClickDisableUser}
          isLoading={isLoading}
        />
        <Button
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

export default DisableUserDialog;
