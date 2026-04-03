// (c) Copyright Ascensio System SIA 2009-2026
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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ImageEditor } from "@docspace/ui-kit/components/image-editor";

import { loadAvatar } from "@docspace/shared/api/people";
import { dataUrlToFile } from "@docspace/shared/utils/dataUrlToFile";
import styles from "./AvatarEditorDialog.module.scss";

const IMAGE_CROPPER_HEIGHT = 448;
const HEADER = 70;
const BUTTONS = 72;

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
    isAIAgentsFolderRoot,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreviewState] = useState(null);
  const [scrollBodyHeight, setScrollBodyHeight] = useState(null);

  const editorBorderRadius = isProfileUpload ? 400 : 110;

  const avatarTitle = isProfileUpload
    ? t("Ldap:LdapAvatar")
    : isAIAgentsFolderRoot
      ? t("RoomLogoCover:AgentCover")
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
    <ModalDialog
      className={styles.modalDialog}
      displayType="modal"
      withBodyScroll
      visible={visible}
      onClose={onCloseModal}
      withFooterBorder
      withBodyScrollForcibly={!!scrollBodyHeight}
      dataTestId={dataTestId}
      style={
        scrollBodyHeight
          ? { "--modal-body-height": `${scrollBodyHeight}px` }
          : undefined
      }
    >
      <ModalDialog.Header>
        <Text fontSize="21px" fontWeight={700}>
          {avatarTitle}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.bodyContent}>
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
        </div>
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
    </ModalDialog>
  );
};

export default inject(
  ({ peopleStore, settingsStore, userStore, treeFoldersStore }) => {
    const { targetUserStore } = peopleStore;
    const { maxImageUploadSize } = settingsStore;

    const { user: profile } = userStore;

    const { updateCreatedAvatar, setHasAvatar } = targetUserStore;
    const { isAIAgentsFolderRoot } = treeFoldersStore;

    return {
      profile,
      setHasAvatar,
      updateCreatedAvatar,
      maxImageUploadSize,
      isAIAgentsFolderRoot,
    };
  },
)(observer(AvatarEditorDialog));
