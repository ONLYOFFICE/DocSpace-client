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
import { makeAutoObservable } from "mobx";

import {
  ONE_MEGABYTE,
  COMPRESSION_RATIO,
  NO_COMPRESSION_RATIO,
} from "@docspace/shared/constants";

import { toastr } from "@docspace/shared/components/toast";
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
      toastr.error(t("Common:NotSupportedFormat"));
    }
  };
}

export default AvatarEditorDialogStore;
