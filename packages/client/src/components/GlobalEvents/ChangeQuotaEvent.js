import React, { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import toastr from "@docspace/components/toast/toastr";

import { ChangeQuotaDialog } from "../dialogs";
let timerId = null;
const ChangeQuotaEvent = (props) => {
  const {
    visible,
    type,
    ids,
    // setUserQuota,
    bodyDescription,
    headerTitle,
    onClose,
    updateUserQuota,
    successCallback,
    abortCallback,
  } = props;
  const { t } = useTranslation("Common");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const sizeRef = useRef("");

  const onSetQuotaBytesSize = (size) => {
    sizeRef.current = size;
  };

  const onSaveClick = async () => {
    const size = sizeRef.current;

    if (!size || (typeof size === "string" && size?.trim() === "")) {
      setIsError(true);
      return;
    }

    timerId = setTimeout(() => setIsLoading(true), 500);
    //await setUserQuota(size, true, t);
    type === "user" ? await updateUserQuota(size, ids) : null;

    timerId && clearTimeout(timerId);
    timerId = null;

    console.log("onSaveClick", props);
    setIsLoading(false);
    setIsError(false);
    successCallback && successCallback();
    onClose && onClose();
  };

  const onCloseClick = () => {
    timerId && clearTimeout(timerId);
    timerId = null;
    console.log("onCloseClick", props);
    abortCallback && abortCallback();
    onClose && onClose();
  };

  return (
    <ChangeQuotaDialog
      visible={visible}
      onSaveClick={onSaveClick}
      onCloseClick={onCloseClick}
      onSetQuotaBytesSize={onSetQuotaBytesSize}
      bodyDescription={bodyDescription}
      headerTitle={headerTitle}
      isError={isError}
      isLoading={isLoading}
    />
  );
};

export default inject(({ auth, dialogsStore, peopleStore }) => {
  const { currentQuotaStore } = auth;
  const { setChangeQuotaDialogVisible } = dialogsStore;
  const { setUserQuota } = currentQuotaStore;
  const { usersStore } = peopleStore;
  const { updateUserQuota } = usersStore;
  return {
    setUserQuota,
    updateUserQuota,
    setChangeQuotaDialogVisible,
  };
})(observer(ChangeQuotaEvent));
