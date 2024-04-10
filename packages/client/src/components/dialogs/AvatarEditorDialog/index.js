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
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import {
  ImageEditor,
  AvatarPreview,
} from "@docspace/shared/components/image-editor";

import { loadAvatar, deleteAvatar } from "@docspace/shared/api/people";
import { dataUrlToFile } from "@docspace/shared/utils/dataUrlToFile";

import DefaultUserAvatarMax from "PUBLIC_DIR/images/default_user_photo_size_200-200.png";

const StyledModalDialog = styled(ModalDialog)`
  .wrapper-image-editor {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    .avatar-editor {
      display: flex;
      gap: 16px;
      align-items: center;
    }
  }
`;

const AvatarEditorDialog = (props) => {
  const { t } = useTranslation([
    "Profile",
    "PeopleTranslations",
    "ProfileAction",
    "Common",
    "CreateEditRoomDialog",
  ]);

  const { visible, onClose, profile, updateCreatedAvatar, setHasAvatar } =
    props;
  const [avatar, setAvatar] = useState({
    uploadedFile: profile.hasAvatar
      ? profile.avatarOriginal
      : DefaultUserAvatarMax,
    x: 0.5,
    y: 0.5,
    zoom: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onChangeAvatar = (newAvatar) => setAvatar(newAvatar);

  const onSaveClick = async () => {
    setIsLoading(true);

    if (!avatar.uploadedFile) {
      const res = await deleteAvatar(profile.id);
      updateCreatedAvatar(res);
      setHasAvatar(false);
      onClose();
      return;
    }
    const file = await dataUrlToFile(preview);

    const avatarData = new FormData();
    avatarData.append("file", file);
    avatarData.append("Autosave", true);

    try {
      const res = await loadAvatar(profile.id, avatarData);

      if (res.success) {
        res.data && updateCreatedAvatar(res.data);
        setHasAvatar(true);
        toastr.success(t("Common:ChangesSavedSuccessfully"));
      } else {
        throw new Error(t("Common:ErrorInternalServer"));
      }

      onClose();
    } catch (error) {
      console.error(error);
      toastr.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
          {t("EditPhoto")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <ImageEditor
          t={t}
          className="wrapper-image-editor"
          classNameWrapperImageCropper="avatar-editor"
          image={avatar}
          setPreview={setPreview}
          onChangeImage={onChangeAvatar}
          Preview={
            <AvatarPreview avatar={preview} userName={profile.displayName} />
          }
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="save"
          key="AvatarEditorSaveBtn"
          label={t("Common:SaveButton")}
          size="normal"
          scale
          primary={true}
          onClick={onSaveClick}
          isLoading={isLoading}
        />
        <Button
          className="cancel-button"
          key="AvatarEditorCloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ peopleStore }) => {
  const { targetUserStore } = peopleStore;

  const {
    targetUser: profile,
    updateCreatedAvatar,
    setHasAvatar,
  } = targetUserStore;

  return {
    profile,
    setHasAvatar,
    updateCreatedAvatar,
  };
})(observer(AvatarEditorDialog));
