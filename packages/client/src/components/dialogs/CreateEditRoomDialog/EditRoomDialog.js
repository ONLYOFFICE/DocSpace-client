import React, { useState, useEffect, useRef, useCallback } from "react";

import TagHandler from "./handlers/TagHandler";
import SetRoomParams from "./sub-components/SetRoomParams";
import DialogHeader from "./sub-components/DialogHeader";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";

const EditRoomDialog = ({
  t,
  visible,
  onClose,
  onSave,
  isLoading,
  fetchedRoomParams,
  fetchedTags,
  fetchedImage,
}) => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);

  const [roomParams, setRoomParams] = useState({
    ...fetchedRoomParams,
  });

  const prevRoomParams = useRef(
    Object.freeze({
      ...roomParams,
    })
  );

  const compareRoomParams = (prevParams, currentParams) => {
    return (
      prevParams.title === currentParams.title &&
      prevParams.roomOwner.id === currentParams.roomOwner.id &&
      prevParams.tags.map((t) => t.name).sort().join("|").toLowerCase() ===
        currentParams.tags.map((t) => t.name).sort().join("|").toLowerCase() &&
      ((prevParams.icon.uploadedFile === "" &&
        currentParams.icon.uploadedFile === null) ||
        prevParams.icon.uploadedFile === currentParams.icon.uploadedFile) &&
      prevParams.indexing === currentParams.indexing
    );
  };

  const setRoomTags = (newTags) =>
    setRoomParams({ ...roomParams, tags: newTags });

  const tagHandler = new TagHandler(roomParams.tags, setRoomTags, fetchedTags);

  const setRoomType = (newRoomType) =>
    setRoomParams((prev) => ({
      ...prev,
      type: newRoomType,
    }));

  const onKeyUpHandler = (e) => {
    if (isWrongTitle) return;
    if (e.keyCode === 13) onEditRoom();
  };

  const onEditRoom = () => {
    if (!roomParams.title.trim()) {
      setIsValidTitle(false);
      return;
    }

    onSave(roomParams);
  };

  useEffect(() => {
    if (fetchedImage) {
      setRoomParams({
        ...roomParams,
        icon: { ...roomParams.icon, uploadedFile: fetchedImage },
      });
      prevRoomParams.current = {
        ...roomParams,
        icon: { ...roomParams.icon, uploadedFile: fetchedImage },
      };
    }
  }, [fetchedImage]);

  const onCloseAction = () => {
    if (isLoading) return;

    onClose && onClose();
  };

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll
      visible={visible}
      onClose={onCloseAction}
      isScrollLocked={isScrollLocked}
      withFooterBorder
    >
      <ModalDialog.Header>
        <DialogHeader isEdit />
      </ModalDialog.Header>

      <ModalDialog.Body>
        <SetRoomParams
          t={t}
          tagHandler={tagHandler}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          setRoomType={setRoomType}
          setIsScrollLocked={setIsScrollLocked}
          isEdit
          isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUpHandler}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          tabIndex={5}
          label={t("Common:SaveButton")}
          size="normal"
          primary
          scale
          onClick={onEditRoom}
          isDisabled={
            isWrongTitle ||
            compareRoomParams(prevRoomParams.current, roomParams)
          }
          isLoading={isLoading}
        />
        <Button
          tabIndex={5}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditRoomDialog;
