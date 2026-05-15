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
import { makeAutoObservable } from "mobx";

import {
  ONE_MEGABYTE,
  COMPRESSION_RATIO,
  NO_COMPRESSION_RATIO,
} from "@docspace/shared/constants";

import { toastr } from "@docspace/ui-kit/components/toast";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";

import resizeImage from "resize-image";
import api from "@docspace/shared/api";
import { calculateRoomLogoParams } from "SRC_DIR/helpers/filesUtils";

class AvatarEditorDialogStore {
  uploadedFile = null;

  image = {
    uploadedFile: this.uploadedFile,
    x: 0.5,
    y: 0.5,
    zoom: 1,
  };

  avatarEditorDialogVisible = false;

  constructor(filesStore, settingsStore) {
    makeAutoObservable(this);

    this.filesStore = filesStore;
    this.settingsStore = settingsStore;
  }

  setAvatarEditorDialogVisible = (visible) => {
    this.avatarEditorDialogVisible = visible;
  };

  setUploadedFile = (file) => {
    this.uploadedFile = file;
  };

  clearUploadedFile = () => {
    this.uploadedFile = null;
  };

  setImage = (image) => {
    this.image = { ...image, uploadedFile: this.uploadedFile };
  };

  onChangeFile = async (e, t) => {
    const uploadedFile = await this.uploadFile(t, e);
    this.setImage({ ...this.image, uploadedFile });
  };

  getUploadedLogoData = async () => {
    const uploadLogoData = new FormData();
    uploadLogoData.append(0, this.uploadedFile);

    const responseData = await api.rooms.uploadRoomLogo(uploadLogoData);
    const url = URL.createObjectURL(this.uploadedFile);
    const img = new Image();

    this.setImage({ uploadedFile: null, x: 0.5, y: 0.5, zoom: 1 });
    this.setUploadedFile(null);

    return {
      responseData,
      url,
      img,
    };
  };

  onSaveRoomLogo = async (roomId, icon, item, needUpdate = false) => {
    let room;

    if (!this.uploadedFile) return;

    const { setActiveFolders, updateRoom } = this.filesStore;

    const data = await this.getUploadedLogoData();
    const { responseData, url, img } = data;

    const promise = new Promise((resolve) => {
      img.onload = async () => {
        const { x, y, zoom } = icon;

        try {
          room = await api.rooms.addLogoToRoom(roomId, {
            tmpFile: responseData.data,
            ...calculateRoomLogoParams(img, x, y, zoom),
          });
        } catch (e) {
          toastr.error(e);
        }

        needUpdate && updateRoom(item, room);
        URL.revokeObjectURL(img.src);
        setActiveFolders([]);
        resolve();
      };

      img.src = url;
    });

    await promise;

    this.setAvatarEditorDialogVisible(false);
  };

  uploadFile = async (t, e) => {
    const file = await getFilesFromEvent(e);
    const uploadedFile = await this.uploadFileToImageEditor(t, file[0]);

    this.setUploadedFile(uploadedFile);
    this.setImage({ ...this.image, uploadedFile });
    this.setAvatarEditorDialogVisible(true);

    return uploadedFile;
  };

  resizeRecursiveAsync = async (
    img,
    canvas,
    compressionRatio = COMPRESSION_RATIO,
    depth = 0,
  ) => {
    const data = resizeImage.resize(
      canvas,
      img.width / compressionRatio,
      img.height / compressionRatio,
      resizeImage.JPEG,
    );

    const file = await fetch(data)
      .then((res) => res.blob())
      .then((blob) => {
        const f = new File([blob], "File name", {
          type: "image/jpg",
        });
        return f;
      });

    if (file.size < ONE_MEGABYTE) {
      return file;
    }

    if (depth > 5) {
      throw new Error("recursion depth exceeded");
    }

    return this.resizeRecursiveAsync(
      img,
      canvas,
      compressionRatio + 1,
      depth + 1,
    );
  };

  uploadFileToImageEditor = async (t, file) => {
    try {
      const imageBitMap = await createImageBitmap(file);

      const width = imageBitMap.width;
      const height = imageBitMap.height;

      const canvas = resizeImage.resize2Canvas(imageBitMap, width, height);

      return this.resizeRecursiveAsync(
        { width, height },
        canvas,
        file.size > ONE_MEGABYTE ? COMPRESSION_RATIO : NO_COMPRESSION_RATIO,
      )
        .then((f) => {
          if (f instanceof File) return f;
        })
        .catch((error) => {
          if (
            error instanceof Error &&
            error.message === "recursion depth exceeded"
          ) {
            toastr.error(t("Common:SizeImageLarge"));
          }
        });
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:NotSupportedFormat"));
    }
  };
}

export default AvatarEditorDialogStore;
