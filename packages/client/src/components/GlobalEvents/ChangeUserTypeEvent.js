// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ChangeUserTypeDialog } from "../dialogs";
import { toastr } from "@docspace/shared/components/toast";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

const ChangeUserTypeEvent = ({
  setVisible,
  visible,
  peopleDialogData,
  peopleFilter,
  updateUserType,
  onClose,
  setSelected,
  getPeopleListItem,
  setInfoPanelSelection,
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
      "/payments/portal-payments",
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

          setInfoPanelSelection(user);
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
          true,
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

export default inject(
  ({ authStore, dialogsStore, peopleStore, infoPanelStore }) => {
    const {
      changeUserTypeDialogVisible: visible,
      setChangeUserTypeDialogVisible: setVisible,
    } = dialogsStore;
    const { isRoomAdmin } = authStore;
    const { setInfoPanelSelection } = infoPanelStore;
    const { dialogStore, filterStore, usersStore } = peopleStore;

    const { data: peopleDialogData } = dialogStore;
    const { filter: peopleFilter } = filterStore;
    const { updateUserType, getPeopleListItem, needResetUserSelection } =
      usersStore;
    const { setSelected } = peopleStore.selectionStore;
    return {
      isRoomAdmin,
      needResetUserSelection,
      getPeopleListItem,
      setInfoPanelSelection,
      setSelected,

      visible,
      setVisible,
      peopleDialogData,
      peopleFilter,
      updateUserType,
    };
  },
)(observer(ChangeUserTypeEvent));
