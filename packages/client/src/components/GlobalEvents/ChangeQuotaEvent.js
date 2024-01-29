import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";

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
    setCustomUserQuota,
    updateRoomQuota,
    successCallback,
    abortCallback,
    initialSize,
    inRoom,
    calculateSelection,
    needResetSelection,
    getPeopleListItem,
    setInfoPanelSelection,
  } = props;

  const { t } = useTranslation("Common");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [size, setSize] = useState(initialSize);

  const onSetQuotaBytesSize = (size) => {
    setSize(size);
  };

  const updateFunction = (size) => {
    return type === "user"
      ? setCustomUserQuota(size, ids)
      : updateRoomQuota(size, ids, inRoom);
  };
  const onSaveClick = async () => {
    if (!size || size.trim() === "") {
      setIsError(true);
      return;
    }

    timerId = setTimeout(() => setIsLoading(true), 200);
    let items;

    try {
      items = await updateFunction(size);
      toastr.success(t("Common:StorageQuotaSet"));

      successCallback && successCallback(items);

      if (!needResetSelection) {
        if (type === "user") {
          const user = getPeopleListItem(items[0]);

          setInfoPanelSelection(user);
        } else {
          setInfoPanelSelection(calculateSelection());
        }
      }
    } catch (e) {
      toastr.error(e);

      abortCallback && abortCallback();
    }

    timerId && clearTimeout(timerId);
    timerId = null;

    setIsLoading(false);
    setIsError(false);

    onClose && onClose();
  };

  const onCloseClick = () => {
    timerId && clearTimeout(timerId);
    timerId = null;

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
      initialSize={initialSize}
      size={size}
    />
  );
};

export default inject(({ peopleStore, filesStore, auth }, { type }) => {
  const { usersStore } = peopleStore;
  const { setCustomUserQuota, getPeopleListItem, needResetUserSelection } =
    usersStore;
  const { updateRoomQuota, needResetFilesSelection } = filesStore;
  const { currentQuotaStore, infoPanelStore } = auth;
  const { defaultUsersQuota, defaultRoomsQuota } = currentQuotaStore;
  const {
    selection: infoPanelSelection,
    calculateSelection,
    setInfoPanelSelection,
  } = infoPanelStore;

  const size = type === "user" ? defaultUsersQuota : defaultRoomsQuota;

  const initialSize = size.toString();

  const inRoom = infoPanelSelection?.inRoom;
  const needResetSelection =
    type === "user" ? needResetUserSelection : needResetFilesSelection;

  return {
    initialSize,
    setCustomUserQuota,
    updateRoomQuota,
    inRoom,
    calculateSelection,
    getPeopleListItem,
    needResetSelection,
    setInfoPanelSelection,
  };
})(observer(ChangeQuotaEvent));
