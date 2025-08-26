// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { mobile } from "@docspace/shared/utils/device";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { ImageEditor } from "@docspace/shared/components/image-editor";

import { loadAvatar } from "@docspace/shared/api/people";
import { dataUrlToFile } from "@docspace/shared/utils/dataUrlToFile";

const IMAGE_CROPPER_HEIGHT = 448;
const HEADER = 70;
const BUTTONS = 72;

const StyledModalDialog = styled(ModalDialog)`
  #modal-dialog {
    max-height: fit-content;

    .modal-header {
      height: 54px;
      min-height: 54px;
    }

    .modal-footer {
      box-sizing: border-box;
      max-height: 72px;
    }

    ${(props) =>
      props.scrollBodyHeight &&
      css`
        .modal-body {
          height: ${`${props.scrollBodyHeight}px`};
        }
      `}
  }
  .wrapper-image-editor {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    .avatar-editor {
      display: flex;
      gap: 16px;
      align-items: center;

      @media ${mobile} {
        justify-content: center;
      }
    }
  }
`;

const StyledBodyContent = styled.div`
  display: contents;

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
    "Common",
    "CreateEditRoomDialog",
    "Ldap",
    "RoomLogoCover",
  ]);

  const {
    visible,
    onClose,
    onSave,
    profile,
    updateCreatedAvatar,
    setHasAvatar,
    maxImageUploadSize,
    onChangeImage,
    image,
    onChangeFile,
    isProfileUpload,
    setPreview,
    dataTestId,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreviewState] = useState(null);
  const [scrollBodyHeight, setScrollBodyHeight] = useState(null);

  const editorBorderRadius = isProfileUpload ? 400 : 110;

  const avatarTitle = isProfileUpload
    ? t("Ldap:LdapAvatar")
    : t("RoomLogoCover:RoomCover");

  const onResize = () => {
    const imageCropperModalHeight = IMAGE_CROPPER_HEIGHT + HEADER + BUTTONS;
    const screenHeight = document.documentElement.clientHeight;

    if (screenHeight < imageCropperModalHeight)
      setScrollBodyHeight(screenHeight - HEADER - BUTTONS);
    else setScrollBodyHeight(null);
  };

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onCloseModal = () => {
    onChangeImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: null });
    setPreview && setPreview("");
    onClose && onClose();
  };

  const onSaveClick = async () => {
    setIsLoading(true);

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
      onChangeImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: null });
      setIsLoading(false);
    }
  };

  const onSaveAction = async (img) => {
    setIsLoading(true);

    await onSave(img);

    setIsLoading(false);
  };

  return (
    <StyledModalDialog
      displayType="modal"
      withBodyScroll
      visible={visible}
      onClose={onCloseModal}
      withFooterBorder
      withBodyScrollForcibly={!!scrollBodyHeight}
      scrollBodyHeight={scrollBodyHeight}
      dataTestId={dataTestId}
    >
      <ModalDialog.Header>
        <Text fontSize="21px" fontWeight={700}>
          {avatarTitle}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
          <ImageEditor
            t={t}
            className="wrapper-image-editor"
            classNameWrapperImageCropper="avatar-editor"
            image={image}
            setPreview={setPreview || setPreviewState}
            onChangeImage={onChangeImage}
            onChangeFile={onChangeFile}
            maxImageSize={maxImageUploadSize}
            editorBorderRadius={editorBorderRadius}
          />
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="save"
          key="AvatarEditorSaveBtn"
          label={t("Common:SaveButton")}
          size="normal"
          scale
          primary
          onClick={onSave ? () => onSaveAction(image) : onSaveClick}
          isLoading={isLoading}
          testId="avatar_editor_save_button"
        />
        <Button
          className="cancel-button"
          key="AvatarEditorCloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onCloseModal}
          testId="avatar_editor_cancel_button"
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ peopleStore, settingsStore, userStore }) => {
  const { targetUserStore } = peopleStore;
  const { maxImageUploadSize } = settingsStore;

  const { user: profile } = userStore;

  const { updateCreatedAvatar, setHasAvatar } = targetUserStore;

  return {
    profile,
    setHasAvatar,
    updateCreatedAvatar,
    maxImageUploadSize,
  };
})(observer(AvatarEditorDialog));
