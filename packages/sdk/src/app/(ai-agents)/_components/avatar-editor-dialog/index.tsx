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

"use client";

import React, { useState, useEffect } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ImageEditor } from "@docspace/ui-kit/components/image-editor";
import type {
  TImage,
  TChangeImage,
  TSetPreview,
} from "@docspace/ui-kit/components/image-editor/ImageEditor.types";

import styles from "./AvatarEditorDialog.module.scss";

// SDK port of client AvatarEditorDialog. Profile-upload branch is stripped —
// the SDK only mounts this component from SetAgentParams with a custom
// `onSave`, so the internal "load avatar" path is unreachable. AgentCover
// flag is hard-coded true because this dialog is only used inside the
// (ai-agents) route group.

const IMAGE_CROPPER_HEIGHT = 448;
const HEADER = 70;
const BUTTONS = 72;

type AvatarEditorDialogProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (image: TImage) => Promise<void> | void;
  onChangeImage: TChangeImage;
  setPreview?: TSetPreview;
  onChangeFile: (e: React.ChangeEvent<HTMLInputElement>, t: TFunction) => void;
  image: TImage;
  isDisabled?: boolean;
  maxImageSize?: number;
  disableImageRescaling?: boolean;
  classNameWrapperImageCropper?: string;
  dataTestId?: string;
};

const AvatarEditorDialog = ({
  visible,
  onClose,
  onSave,
  onChangeImage,
  setPreview,
  onChangeFile,
  image,
  isDisabled,
  maxImageSize,
  disableImageRescaling,
  classNameWrapperImageCropper = "avatar-editor",
  dataTestId,
}: AvatarEditorDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const [isLoading, setIsLoading] = useState(false);
  const [scrollBodyHeight, setScrollBodyHeight] = useState<number | null>(null);

  // Agent cover — hard-coded title for the SDK port.
  const avatarTitle = t("Common:AgentCover", {
    defaultValue: "Agent cover",
  });

  const editorBorderRadius = 110;

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
    onChangeImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: undefined });
    setPreview?.("");
    onClose?.();
  };

  const onSaveAction = async (img: TImage) => {
    setIsLoading(true);
    await onSave(img);
    setIsLoading(false);
  };

  return (
    <ModalDialog
      className={styles.modalDialog}
      displayType={ModalDialogType.modal}
      withBodyScroll
      visible={visible}
      onClose={onCloseModal}
      withFooterBorder
      withBodyScrollForcibly={!!scrollBodyHeight}
      dataTestId={dataTestId}
      style={
        scrollBodyHeight
          ? ({ "--modal-body-height": `${scrollBodyHeight}px` } as React.CSSProperties)
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
            classNameWrapperImageCropper={classNameWrapperImageCropper}
            image={image}
            setPreview={setPreview ?? (() => {})}
            onChangeImage={onChangeImage}
            onChangeFile={(e) => onChangeFile(e, t)}
            maxImageSize={maxImageSize}
            disableImageRescaling={disableImageRescaling}
            editorBorderRadius={editorBorderRadius}
            isDisabled={!!isDisabled}
            Preview={null}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="save"
          key="AvatarEditorSaveBtn"
          label={t("Common:SaveButton", { defaultValue: "Save" })}
          size={ButtonSize.normal}
          scale
          primary
          onClick={() => onSaveAction(image)}
          isLoading={isLoading}
          testId="avatar_editor_save_button"
        />
        <Button
          className="cancel-button"
          key="AvatarEditorCloseBtn"
          label={t("Common:CancelButton", { defaultValue: "Cancel" })}
          size={ButtonSize.normal}
          scale
          onClick={onCloseModal}
          testId="avatar_editor_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default AvatarEditorDialog;
