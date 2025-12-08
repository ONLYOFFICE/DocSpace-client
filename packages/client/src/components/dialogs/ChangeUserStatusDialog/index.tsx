// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { ButtonKeys, EmployeeStatus } from "@docspace/shared/enums";

import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import { TChangeUserStatusDialogData } from "SRC_DIR/helpers/contacts";

type ChangeUserStatusDialogComponentProps = {
  getPeopleListItem: UsersStore["getPeopleListItem"];
  updateUserStatus: UsersStore["updateUserStatus"];
  setSelected: UsersStore["setSelected"];
  needResetUserSelection: UsersStore["needResetUserSelection"];

  infoPanelVisible: InfoPanelStore["isVisible"];
  setSelection: UsersStore["setSelection"];

  visible: boolean;

  onClose: VoidFunction;
} & TChangeUserStatusDialogData;

const ChangeUserStatusDialogComponent = ({
  getPeopleListItem,
  updateUserStatus,
  setSelected,
  needResetUserSelection,
  infoPanelVisible,
  setSelection,
  status,
  userIDs,
  visible,
  isGuests,
  onClose,
}: ChangeUserStatusDialogComponentProps) => {
  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const { t } = useTranslation([
    "ChangeUserStatusDialog",
    "Common",
    "PeopleTranslations",
  ]);

  const onChangeUserStatus = React.useCallback(() => {
    if (isRequestRunning) return;

    setIsRequestRunning(true);

    updateUserStatus(status, userIDs)
      .then((users) => {
        if (users.length === 1 && infoPanelVisible) {
          const user = getPeopleListItem(users[0]);

          setSelection([user]);
        }

        toastr.success(
          isGuests
            ? t("PeopleTranslations:SuccessChangeGuestStatus")
            : t("PeopleTranslations:SuccessChangeUserStatus"),
        );
      })
      .catch(() => {
        toastr.error(
          <PaidQuotaLimitError
            isRoomAdmin={undefined}
            setInvitePanelOptions={undefined}
            invitePanelVisible={undefined}
          />,
          "",
          0,
          true,
          true,
        );
      })
      .finally(() => {
        setIsRequestRunning(false);
        if (needResetUserSelection) setSelected("close");
        onClose();
      });
  }, [
    getPeopleListItem,
    infoPanelVisible,
    isGuests,
    isRequestRunning,
    needResetUserSelection,
    onClose,
    setSelected,
    status,
    t,
    updateUserStatus,
    userIDs,
  ]);

  const onCloseAction = React.useCallback(() => {
    if (isRequestRunning) return;

    onClose();
  }, [isRequestRunning, onClose]);

  const onKeyUpHandler = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.esc) onCloseAction();
      if (e.key === ButtonKeys.enter) onChangeUserStatus();
    },
    [onChangeUserStatus, onCloseAction],
  );

  React.useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  const needDisabled = status === EmployeeStatus.Disabled;
  const onlyOneUser = userIDs.length === 1;

  let header = "";
  let bodyText = "";
  let buttonLabelSave = "";

  if (needDisabled) {
    header = onlyOneUser
      ? isGuests
        ? t("DisableGuest")
        : t("DisableUser")
      : isGuests
        ? t("DisableGuests")
        : t("DisableUsers");

    bodyText = onlyOneUser
      ? isGuests
        ? t("DisableGuestDescription", { productName: t("Common:ProductName") })
        : t("DisableUserDescription", { productName: t("Common:ProductName") })
      : isGuests
        ? t("DisableGuestsDescription", {
            productName: t("Common:ProductName"),
          })
        : t("DisableUsersDescription", {
            productName: t("Common:ProductName"),
          });

    bodyText += isGuests
      ? t("DisableGuestsGeneralDescription")
      : t("DisableGeneralDescription");

    buttonLabelSave = isGuests
      ? t("Common:Disable")
      : t("PeopleTranslations:DisableUserButton");
  } else {
    header = onlyOneUser
      ? isGuests
        ? t("EnableGuest")
        : t("EnableUser")
      : isGuests
        ? t("EnableGuests")
        : t("EnableUsers");

    bodyText = onlyOneUser
      ? isGuests
        ? t("EnableGuestDescription", { productName: t("Common:ProductName") })
        : t("EnableUserDescription", { productName: t("Common:ProductName") })
      : isGuests
        ? t("EnableGuestsDescription", { productName: t("Common:ProductName") })
        : t("EnableUsersDescription", { productName: t("Common:ProductName") });

    buttonLabelSave = t("Common:Enable");
  }

  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseAction}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      dataTestId="change_user_status_dialog"
    >
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{bodyText}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="change-user-status-modal_submit"
          label={buttonLabelSave}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onChangeUserStatus}
          isLoading={isRequestRunning}
          isDisabled={userIDs.length === 0}
          testId="change_user_status_dialog_submit"
        />
        <Button
          id="change-user-status-modal_cancel"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onCloseAction}
          isDisabled={isRequestRunning}
          testId="change_user_status_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const ChangeUserStatusDialog = ChangeUserStatusDialogComponent;

export default inject(({ peopleStore, infoPanelStore }: TStore) => {
  const {
    getPeopleListItem,
    updateUserStatus,
    needResetUserSelection,
    setSelected,
    setSelection,
  } = peopleStore.usersStore!;

  const { isVisible: infoPanelVisible } = infoPanelStore;

  return {
    needResetUserSelection: !infoPanelVisible || needResetUserSelection,
    updateUserStatus,

    setSelected,

    getPeopleListItem,

    infoPanelVisible,
    setSelection,
  };
})(observer(ChangeUserStatusDialog));
