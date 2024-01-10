import React, { useState } from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";

import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";

import TagHandler from "./handlers/TagHandler";

import SetRoomParams from "./sub-components/SetRoomParams";
import RoomTypeList from "./sub-components/RoomTypeList";
import DialogHeader from "./sub-components/DialogHeader";

interface CreateGroupDialogProps {}

const EditGroupDialog = ({
  visible,
  title,
  onClose,
  onCreate,

  fetchedTags,
  isLoading,
  setIsLoading,

  deleteThirdParty,
  fetchThirdPartyProviders,
  enableThirdParty,
}: CreateGroupDialogProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  return (
    <ModalDialog
      displayType="aside"
      withBodyScroll
      visible={true}
      onClose={onClose}
      //   isScrollLocked={isScrollLocked}
      withFooterBorder
      //   isOauthWindowOpen={isOauthWindowOpen}
    >
      <ModalDialog.Header>Header</ModalDialog.Header>
      <ModalDialog.Body>Body</ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="create-group-modal_submit"
          tabIndex={5}
          label={t("Common:Create")}
          size="normal"
          primary
          scale
          // onClick={onCreateRoom}
          // isDisabled={isRoomTitleChanged || isWrongTitle}
          isLoading={isLoading}
        />
        <Button
          id="create-group-modal_cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          isDisabled={isLoading}
          // onClick={}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditGroupDialog;
