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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import TagHandler from "../CreateEditRoomDialog/handlers/TagHandler";
import SetRoomParams from "../CreateEditRoomDialog/sub-components/SetRoomParams";
import { StyledFooter } from "./CreateRoomTemplate.styled";

const CreateRoomTemplate = (props) => {
  const {
    visible,
    onClose,
    item,
    fetchedTags,
    isEdit,
    setAccessSettingsIsVisible,
    accessSettingsIsVisible,
    fetchedRoomParams,
  } = props;
  const { title } = item;
  console.log("item", item);

  const [roomParams, setRoomParams] = useState({
    ...fetchedRoomParams,
  });

  const startTags = Object.values(item.tags);
  const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));
  const [tags, setTags] = useState(startObjTags);

  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [roomName, setRoomName] = useState(title);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);

  const [openCreatedIsChecked, setOpenCreatedIsChecked] = useState(true);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  const setRoomType = (newRoomType) =>
    setRoomParams((prev) => ({
      ...prev,
      type: newRoomType,
    }));

  const onKeyUp = (e: KeyboardEvent) => {
    if (isWrongTitle) return;
    if (e.keyCode === 13) onCreateRoomTemplate();
  };

  const onCreateRoomTemplate = () => {
    if (!roomName.trim()) {
      setIsValidTitle(false);
      return;
    }

    // onSave(roomParams);

    console.log("onCreateRoomTemplate");
    // onClose();
  };

  const setRoomTags = (newTags) => {
    setTags(newTags);
  };

  const onChangeOpenCreated = () => {
    setOpenCreatedIsChecked(!openCreatedIsChecked);
  };

  const onOpenAccessSettings = () => {
    setAccessSettingsIsVisible(true);
  };

  const tagHandler = new TagHandler(tags, setRoomTags, fetchedTags);

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={visible}
      onClose={onClose}
      withFooterBorder
      withForm
      onSubmit={onCreateRoomTemplate}
      // withBodyScroll={!isTemplate}
      // isScrollLocked={isScrollLocked}
      hideContent={accessSettingsIsVisible}
      // containerVisible={}
    >
      <ModalDialog.Header>
        <Text fontSize="21px" fontWeight={700}>
          {item.isEdit ? t("Files:EditTemplate") : t("Files:SaveAsTemplate")}
        </Text>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <SetRoomParams
          isSaveAsTemplate
          t={t}
          tagHandler={tagHandler}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          setRoomType={setRoomType}
          setIsScrollLocked={setIsScrollLocked}
          isEdit={isEdit}
          // isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUp}
          onOpenAccessSettings={onOpenAccessSettings}
          createdBy={item.createdBy}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <StyledFooter isEdit={item.isEdit}>
          {!item.isEdit && (
            <Checkbox
              label={t("Files:OpenCreatedTemplate")}
              isChecked={openCreatedIsChecked}
              onChange={onChangeOpenCreated}
            />
          )}

          <div className="create-room-template_buttons">
            <Button
              id="create-room-template-modal_submit"
              tabIndex={5}
              label={
                item.isEdit ? t("Common:SaveButton") : t("Files:CreateTemplate")
              }
              size={ButtonSize.normal}
              primary
              scale
              onClick={onCreateRoomTemplate}
              isDisabled={isWrongTitle}
              // isDisabled={isRoomTitleChanged || isWrongTitle}
              // isLoading={isLoading}
              type="submit"
            />
            <Button
              id="create-room-template-modal_cancel"
              tabIndex={5}
              label={t("Common:CancelButton")}
              size={ButtonSize.normal}
              scale
              // isDisabled={isLoading}
              onClick={onClose}
            />
          </div>
        </StyledFooter>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ settingsStore, dialogsStore }) => {
  const {
    setTemplateAccessSettingsVisible: setAccessSettingsIsVisible,
    templateAccessSettingsVisible: accessSettingsIsVisible,
  } = dialogsStore;

  return {
    accessSettingsIsVisible,
    setAccessSettingsIsVisible,
  };
})(observer(CreateRoomTemplate));
