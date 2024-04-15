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
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";

import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";

import RoomType from "../CreateEditRoomDialog/sub-components/RoomType";
import InputParam from "../CreateEditRoomDialog/sub-components/Params/InputParam";
import TagInput from "../CreateEditRoomDialog/sub-components/TagInput";
import TagHandler from "../CreateEditRoomDialog/handlers/TagHandler";
import { ImageEditor } from "@docspace/shared/components/image-editor";
import ChangeRoomOwner from "../CreateEditRoomDialog/sub-components/ChangeRoomOwner";
import PreviewTile from "@docspace/shared/components/image-editor/PreviewTile";
import { getRoomTypeTitleTranslation } from "../CreateEditRoomDialog/data";

const StyledModalDialog = styled(ModalDialog)`
  .create-room-template_body {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 22px;
  }

  .icon-editor_text {
    margin-bottom: 6px;
  }

  .icon-editor {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: start;
    gap: 16px;
  }

  .modal-footer {
    display: block;
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-top: 16px;
`;

const CreateRoomTemplate = (props) => {
  const { visible, onClose, item, fetchedTags, folderFormValidation } = props;
  const { roomType, title, logo, createdBy } = item;
  console.log("item", item);

  const startTags = Object.values(item.tags);
  const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));
  const [tags, setTags] = useState(startObjTags);

  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [roomName, setRoomName] = useState(title);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const [icon, setIcon] = useState({
    uploadedFile: logo.original,
    tmpFile: "",
    x: 0.5,
    y: 0.5,
    zoom: 1,
  });
  const [previewIcon, setPreviewIcon] = useState(null);

  const [openCreatedIsChecked, setOpenCreatedIsChecked] = useState(true);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  const onChangeName = (e) => {
    setIsValidTitle(true);
    if (e.target.value.match(folderFormValidation)) {
      setIsWrongTitle(true);
    } else {
      setIsWrongTitle(false);
    }
    setRoomName(e.target.value);
  };

  const onKeyUp = (e) => {
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

  const onChangeImage = (icon) => {
    setIcon(icon);
  };

  const onChangeOpenCreated = () => {
    setOpenCreatedIsChecked(!openCreatedIsChecked);
  };

  const tagHandler = new TagHandler(tags, setRoomTags, fetchedTags);

  return (
    <StyledModalDialog
      displayType="aside"
      withBodyScroll
      visible={visible}
      onClose={onClose}
      withFooterBorder
    >
      <ModalDialog.Header>
        <Text fontSize="21px" fontWeight={700}>
          {t("Files:SaveAsTemplate")}
        </Text>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className="create-room-template_body">
          <RoomType t={t} roomType={roomType} type="displayItem" />

          <InputParam
            id="shared_room-name"
            title={`${t("Files:TemplateName")}:`}
            placeholder={t("Common:EnterName")}
            value={roomName}
            onChange={onChangeName}
            // isDisabled={isDisabled}
            isValidTitle={isValidTitle}
            isWrongTitle={isWrongTitle}
            errorMessage={
              isWrongTitle
                ? t("Files:ContainsSpecCharacter")
                : t("Common:RequiredField")
            }
            onKeyUp={onKeyUp}
            isAutoFocussed
          />

          <TagInput
            t={t}
            title={t("Files:RoomTags")}
            tagHandler={tagHandler}
            setIsScrollLocked={setIsScrollLocked}
            tooltipLabel={t("Files:RoomTagsTooltip")}
            // isDisabled={isDisabled}
          />

          <ChangeRoomOwner
            roomOwner={createdBy}
            isTemplate
            onOwnerChange={() => console.log("Access settings")}
          />

          <div>
            <Text fontWeight={600} className="icon-editor_text">
              {t("Icon")}
            </Text>
            <ImageEditor
              t={t}
              // isDisabled={isDisabled}
              image={icon}
              setPreview={setPreviewIcon}
              onChangeImage={onChangeImage}
              classNameWrapperImageCropper={"icon-editor"}
              Preview={
                <PreviewTile
                  t={t}
                  title={roomName || t("Files:NewRoom")}
                  subtitle={getRoomTypeTitleTranslation(roomType, t)}
                  previewIcon={previewIcon}
                  // isDisabled={isDisabled}
                />
              }
            />
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Checkbox
          label={t("Files:OpenCreatedTemplate")}
          isChecked={openCreatedIsChecked}
          onChange={onChangeOpenCreated}
        />

        <StyledButtonContainer>
          <Button
            id="create-room-template-modal_submit"
            tabIndex={5}
            label={t("Files:CreateTemplate")}
            size="normal"
            primary
            scale
            onClick={onCreateRoomTemplate}
            isDisabled={isWrongTitle}
            // isLoading={isLoading}
          />
          <Button
            id="create-room-template-modal_cancel"
            tabIndex={5}
            label={t("Common:CancelButton")}
            size="normal"
            scale
            // isDisabled={isLoading}
            onClick={onClose}
          />
        </StyledButtonContainer>
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ settingsStore }) => {
  const { folderFormValidation } = settingsStore;
  return { folderFormValidation };
})(observer(CreateRoomTemplate));
