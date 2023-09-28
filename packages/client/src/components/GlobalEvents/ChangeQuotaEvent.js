import { useState, useRef } from "react";
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
    bodyDescription,
    headerTitle,
    onClose,
    updateUserQuota,
    updateRoomQuota,
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

  const updateFunction = (size) => {
    return type === "user"
      ? updateUserQuota(size, ids)
      : updateRoomQuota(size, ids);
  };
  const onSaveClick = async () => {
    const size = sizeRef.current;

    if (!size || (typeof size === "string" && size?.trim() === "")) {
      setIsError(true);
      return;
    }

    timerId = setTimeout(() => setIsLoading(true), 200);
    let users;

    try {
      users = await updateFunction(size);
      toastr.success(t("Common:StorageQuotaSet"));
    } catch (e) {
      toastr.error(e);
    }

    timerId && clearTimeout(timerId);
    timerId = null;

    console.log("onSaveClick", props);
    setIsLoading(false);
    setIsError(false);

    successCallback && successCallback(users);
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

export default inject(({ peopleStore, filesStore }) => {
  const { usersStore } = peopleStore;
  const { updateUserQuota } = usersStore;
  const { updateRoomQuota } = filesStore;

  return {
    updateUserQuota,
    updateRoomQuota,
  };
})(observer(ChangeQuotaEvent));
