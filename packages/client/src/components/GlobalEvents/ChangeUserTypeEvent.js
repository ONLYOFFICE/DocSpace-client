import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ChangeUserTypeDialog } from "../dialogs";
import toastr from "@docspace/components/toast/toastr";
import Link from "@docspace/components/link";
import Text from "@docspace/components/text";
import { combineUrl } from "@docspace/common/utils";

const ChangeUserTypeEvent = ({
  setVisible,
  visible,
  peopleDialogData,
  peopleFilter,
  updateUserType,
  getUsersList,
  onClose,
  setSelected,
  getPeopleListItem,
  setSelection,
  needResetUserSelection,
  isRoomAdmin,
}) => {
  const { toType, fromType, userIDs, successCallback, abortCallback } =
    peopleDialogData;
  const { t } = useTranslation(["ChangeUserTypeDialog", "Common", "Payments"]);

  const navigate = useNavigate();

  const onKeyUpHandler = (e) => {
    if (e.keyCode === 27) onCloseAction();
    if (e.keyCode === 13) onChangeUserType();
  };
  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, []);

  useEffect(() => {
    if (!peopleDialogData.toType) return;

    setVisible(true);

    return () => {
      setVisible(false);
    };
  }, [peopleDialogData]);

  const onClickPayments = () => {
    const paymentPageUrl = combineUrl(
      "/portal-settings",
      "/payments/portal-payments"
    );

    toastr.clear();
    navigate(paymentPageUrl);
  };

  const onChangeUserType = () => {
    onClosePanel();
    updateUserType(toType, userIDs, peopleFilter, fromType)
      .then((users) => {
        toastr.success(t("SuccessChangeUserType"));

        if (!needResetUserSelection) {
          const user = getPeopleListItem(users[0]);

          setSelection(user);
        }

        successCallback && successCallback(users);
      })
      .catch((err) => {
        toastr.error(
          <>
            <Text>{t("Common:QuotaPaidUserLimitError")}</Text>
            {!isRoomAdmin && (
              <Link color="#5387AD" isHovered={true} onClick={onClickPayments}>
                {t("Common:PaymentsTitle")}
              </Link>
            )}
          </>,
          false,
          0,
          true,
          true
        );

        abortCallback && abortCallback();
      })
      .finally(() => {
        if (needResetUserSelection) setSelected("close");
      });
  };

  const onClosePanel = () => {
    setVisible(false);
    onClose();
  };

  const onCloseAction = async () => {
    await getUsersList(peopleFilter);
    abortCallback && abortCallback();
    onClosePanel();
  };

  const getType = (type) => {
    switch (type) {
      case "admin":
        return t("Common:DocSpaceAdmin");
      case "manager":
        return t("Common:RoomAdmin");
      case "collaborator":
        return t("Common:PowerUser");
      case "user":
      default:
        return t("Common:User");
    }
  };

  const firstType =
    fromType?.length === 1 && fromType[0] ? getType(fromType[0]) : null;
  const secondType = getType(toType);

  return (
    <ChangeUserTypeDialog
      visible={visible}
      firstType={firstType}
      secondType={secondType}
      onCloseAction={onCloseAction}
      onChangeUserType={onChangeUserType}
    />
  );
};

export default inject(({ auth, dialogsStore, peopleStore }) => {
  const {
    changeUserTypeDialogVisible: visible,
    setChangeUserTypeDialogVisible: setVisible,
  } = dialogsStore;
  const { isRoomAdmin, infoPanelStore } = auth;
  const { setSelection } = infoPanelStore;
  const { dialogStore, filterStore, usersStore } = peopleStore;

  const { data: peopleDialogData } = dialogStore;
  const { filter: peopleFilter } = filterStore;
  const {
    updateUserType,
    getUsersList,
    getPeopleListItem,
    needResetUserSelection,
  } = usersStore;
  const { setSelected } = peopleStore.selectionStore;
  return {
    isRoomAdmin,
    needResetUserSelection,
    getPeopleListItem,
    setSelection,
    setSelected,

    visible,
    setVisible,
    peopleDialogData,
    peopleFilter,
    updateUserType,
    getUsersList,
  };
})(observer(ChangeUserTypeEvent));
