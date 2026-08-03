/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import type { Nullable } from "@docspace/shared/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import { calculateRoomLogoParams } from "@docspace/ui-kit/utils";
import { ROOM_ACTION_KEYS } from "@docspace/ui-kit/constants";
import type { TImage } from "@docspace/ui-kit/components/image-editor";
import type { ICover } from "@docspace/ui-kit/components/room-logo-cover-dialog";
import type { TModel } from "@docspace/ui-kit/components/room-icon";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";

import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import DeleteSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import PencilSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";

const EMPTY_IMAGE: TImage = { x: 0.5, y: 0.5, zoom: 1, uploadedFile: undefined };

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });

type UseRoomLogoEditorParams = {
  roomId: number;
  hasImage: boolean;
  onUpdated?: () => void;
};

export const useRoomLogoEditor = ({
  roomId,
  hasImage,
  onUpdated,
}: UseRoomLogoEditorParams) => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useDialogsStore();

  const [cropperImage, setCropperImage] = React.useState<TImage>(EMPTY_IMAGE);
  const [cropperVisible, setCropperVisible] = React.useState(false);
  const [coverDialogVisible, setCoverDialogVisible] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperImage({ ...EMPTY_IMAGE, uploadedFile: file });
    setCropperVisible(true);
  };

  const onCropperChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperImage({ ...EMPTY_IMAGE, uploadedFile: file });
  };

  const onChangeImage = (image: TImage) => setCropperImage(image);

  const onCropperClose = () => {
    setCropperVisible(false);
    setCropperImage(EMPTY_IMAGE);
  };

  const buildLogoParams = async (image: TImage) => {
    if (!(image.uploadedFile instanceof File)) return undefined;

    const file = image.uploadedFile;
    const objectUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("0", file);

    try {
      const [response, img] = await Promise.all([
        api.rooms.uploadRoomLogo(formData) as Promise<{ data?: string }>,
        loadImage(objectUrl),
      ]);

      if (!response?.data) return undefined;

      return {
        tmpFile: response.data,
        ...calculateRoomLogoParams(img, image.x, image.y, image.zoom),
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const onCropperSave = async (image: TImage) => {
    setIsSaving(true);
    try {
      const logo = await buildLogoParams(image);
      if (logo) await api.rooms.addLogoToRoom(roomId, logo);
      onUpdated?.();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsSaving(false);
      setCropperVisible(false);
      setCropperImage(EMPTY_IMAGE);
    }
  };

  const onOpenCoverDialog = () => {
    dialogsStore.getCovers();
    setCoverDialogVisible(true);
  };

  const closeCoverDialog = () => setCoverDialogVisible(false);

  const onApplyCover = async (color: string, cover: ICover | null) => {
    setCoverDialogVisible(false);
    setIsSaving(true);
    try {
      await api.rooms.setRoomCover(roomId, {
        color: color.replace("#", ""),
        cover: cover?.id ?? "",
      });
      onUpdated?.();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteLogo = async () => {
    setIsSaving(true);
    try {
      await api.rooms.removeLogoFromRoom(roomId);
      onUpdated?.();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsSaving(false);
    }
  };

  const model = React.useMemo<TModel[]>(
    () => [
      {
        key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_UPLOAD,
        label: t("Common:UploadPicture"),
        icon: UploadSvgUrl,
        onClick: (ref?: React.RefObject<Nullable<HTMLInputElement>>) =>
          ref?.current?.click(),
      },
      hasImage
        ? {
            key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_DELETE,
            label: t("Common:Delete"),
            icon: DeleteSvgUrl,
            onClick: onDeleteLogo,
          }
        : {
            key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_CUSTOMIZE_COVER,
            label: t("Common:CustomizeCover"),
            icon: PencilSvgUrl,
            onClick: onOpenCoverDialog,
          },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasImage, t, roomId],
  );

  return {
    model,
    isSaving,
    onChangeFile,
    cropper: {
      image: cropperImage,
      visible: cropperVisible,
      onChangeImage,
      onChangeFile: onCropperChangeFile,
      onSave: onCropperSave,
      onClose: onCropperClose,
    },
    coverDialog: {
      visible: coverDialogVisible,
      covers: dialogsStore.covers,
      onApply: onApplyCover,
      onClose: closeCoverDialog,
    },
  };
};

export default useRoomLogoEditor;
