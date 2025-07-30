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

import { useEffect, useCallback, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import { ButtonKeys, EmployeeType } from "@docspace/shared/enums";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { downgradeUserType } from "@docspace/shared/api/people";
import { TUser } from "@docspace/shared/api/people/types";

import { TChangeUserTypeDialogData } from "SRC_DIR/helpers/contacts";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import { ChangeUserTypeDialog } from "../dialogs";
import PaidQuotaLimitError from "../PaidQuotaLimitError";

type ChangeUserTypeEventProps = {
  updateUserType: UsersStore["updateUserType"];
  setSelected: UsersStore["setSelected"];
  getPeopleListItem: UsersStore["getPeopleListItem"];
  needResetUserSelection: UsersStore["needResetUserSelection"];

  dialogData: TChangeUserTypeDialogData;

  onClose: VoidFunction;
};

const ChangeUserTypeEvent = ({
  dialogData,
  needResetUserSelection,

  updateUserType,
  setSelected,
  getPeopleListItem,

  onClose,
}: ChangeUserTypeEventProps) => {
  const { t } = useTranslation(["ChangeUserTypeDialog", "Common", "Payments"]);

  const [isRequestRunning, setIsRequestRunning] = useState(false);

  const { toType, fromType, userIDs, successCallback, abortCallback } =
    dialogData;

  const isGuestsDialog = fromType[0] === EmployeeType.Guest;

  const isDowngradeType =
    (toType === EmployeeType.Guest || toType === EmployeeType.User) &&
    fromType[0] !== EmployeeType.Guest;
  const isDowngradeToUser = toType === EmployeeType.User;

  const onCloseAction = useCallback(() => {
    if (isRequestRunning) return;
    abortCallback?.();
    onClose();
  }, [abortCallback, isRequestRunning, onClose]);

  const onChangeUserType = useCallback(() => {
    if (isRequestRunning) return;

    setIsRequestRunning(true);

    const updatePromise = isDowngradeType
      ? downgradeUserType(toType, userIDs[0])
      : updateUserType(toType, userIDs);

    updatePromise
      .then((users) => {
        toastr.success(
          isGuestsDialog
            ? t("SuccessChangeGuestType")
            : t("SuccessChangeUserType"),
        );

        successCallback?.(users as TUser[]);
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

        abortCallback?.();
      })
      .finally(() => {
        if (needResetUserSelection) setSelected("close");
        setIsRequestRunning(false);
        onClose();
      });
  }, [
    abortCallback,
    getPeopleListItem,
    isGuestsDialog,
    isRequestRunning,
    needResetUserSelection,
    onClose,
    setSelected,
    successCallback,
    t,
    toType,
    updateUserType,
    userIDs,
  ]);

  const onKeyUpHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.esc) onCloseAction();
      if (e.key === ButtonKeys.enter) onChangeUserType();
    },
    [onChangeUserType, onCloseAction],
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  useEffect(() => {
    if (!toType) return onClose();

    return () => {
      onClose();
    };
  }, [onClose, toType]);

  const firstType =
    fromType?.length === 1 && fromType[0]
      ? getUserTypeTranslation(fromType[0], t)
      : null;
  const secondType = getUserTypeTranslation(toType, t);

  return (
    <ChangeUserTypeDialog
      visible
      isGuestsDialog={isGuestsDialog}
      firstType={firstType ?? ""}
      secondType={secondType}
      onClose={onCloseAction}
      onChangeUserType={onChangeUserType}
      isRequestRunning={isRequestRunning}
      isDowngradeType={isDowngradeType}
      isDowngradeToUser={isDowngradeToUser}
    />
  );
};

export default inject(({ peopleStore, infoPanelStore }: TStore) => {
  const { dialogStore, usersStore } = peopleStore;

  const { data: dialogData } = dialogStore!;

  const {
    updateUserType,
    getPeopleListItem,
    needResetUserSelection,
    setSelected,
  } = usersStore!;
  const { isVisible: infoPanelVisible } = infoPanelStore;

  return {
    needResetUserSelection: !infoPanelVisible || needResetUserSelection,

    getPeopleListItem,

    dialogData,
    updateUserType,
    setSelected,
  };
})(observer(ChangeUserTypeEvent));
