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
import { calculateRoomLogoParams } from "@docspace/ui-kit/utils";

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TTranslation } from "@docspace/shared/types";
import type FilesStore from "./FilesStore";
import type { TItem } from "./FilesStore";

type TUploadedFile = File | null | undefined;

export type TAvatarImage = {
  uploadedFile: TUploadedFile;
  x: number;
  y: number;
  zoom: number;
};

export type TIconCrop = { x: number; y: number; zoom: number };

type TFilesStore = FilesStore;

class AvatarEditorDialogStore {
  uploadedFile: TUploadedFile = null;

  image: TAvatarImage = {
    uploadedFile: this.uploadedFile,
    x: 0.5,
    y: 0.5,
    zoom: 1,
  };

  avatarEditorDialogVisible = false;

  filesStore: TFilesStore;

  settingsStore: SettingsStore;

  constructor(filesStore: TFilesStore, settingsStore: SettingsStore) {
    makeAutoObservable(this);

    this.filesStore = filesStore;
    this.settingsStore = settingsStore;
  }

  setAvatarEditorDialogVisible = (visible: boolean) => {
    this.avatarEditorDialogVisible = visible;
  };

  setUploadedFile = (file: TUploadedFile) => {
    this.uploadedFile = file;
  };

  clearUploadedFile = () => {
    this.uploadedFile = null;
  };

  setImage = (image: TAvatarImage) => {
    this.image = { ...image, uploadedFile: this.uploadedFile };
  };

  onChangeFile = async (e: unknown, t: TTranslation) => {
    const uploadedFile = await this.uploadFile(t, e);
    this.setImage({ ...this.image, uploadedFile });
  };

  getUploadedLogoData = async () => {
    const uploadLogoData = new FormData();
    // FABLE5-REVIEW: historically append(0, file) relied on JS coercion of
    // both arguments; uploadedFile is guarded non-null by the only caller.
    uploadLogoData.append("0", this.uploadedFile as File);

    // FABLE5-REVIEW: uploadRoomLogo is untyped in shared/api — cast until
    // the api layer is typed.
    const responseData = (await api.rooms.uploadRoomLogo(uploadLogoData)) as {
      data: string;
    };
    const url = URL.createObjectURL(this.uploadedFile as File);
    const img = new Image();

    this.setImage({ uploadedFile: null, x: 0.5, y: 0.5, zoom: 1 });
    this.setUploadedFile(null);

    return {
      responseData,
      url,
      img,
    };
  };

  onSaveRoomLogo = async (
    roomId: number | string | undefined,
    icon: TIconCrop,
    item: unknown,
    needUpdate = false,
  ) => {
    let room: unknown;

    if (!this.uploadedFile) return;

    const { setActiveFolders, updateRoom } = this.filesStore;

    const data = await this.getUploadedLogoData();
    const { responseData, url, img } = data;

    const promise = new Promise<void>((resolve) => {
      img.onload = async () => {
        const { x, y, zoom } = icon;

        try {
          room = await api.rooms.addLogoToRoom(roomId, {
            tmpFile: responseData.data,
            ...calculateRoomLogoParams(img, x, y, zoom),
          });
        } catch (e) {
          toastr.error(e as string);
        }

        needUpdate &&
          updateRoom(item as TItem, room as Parameters<FilesStore["updateRoom"]>[1]);
        URL.revokeObjectURL(img.src);
        setActiveFolders([]);
        resolve();
      };

      img.src = url;
    });

    await promise;

    this.setAvatarEditorDialogVisible(false);
  };

  uploadFile = async (t: TTranslation, e: unknown) => {
    const file = await getFilesFromEvent(e);
    const uploadedFile = await this.uploadFileToImageEditor(t, file[0]);

    this.setUploadedFile(uploadedFile);
    this.setImage({ ...this.image, uploadedFile });
    this.setAvatarEditorDialogVisible(true);

    return uploadedFile;
  };

  resizeRecursiveAsync = async (
    img: { width: number; height: number },
    canvas: HTMLCanvasElement,
    compressionRatio: number = COMPRESSION_RATIO,
    depth = 0,
  ): Promise<File> => {
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

  uploadFileToImageEditor = async (
    t: TTranslation,
    file: File,
  ): Promise<File | undefined> => {
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
          return undefined;
        })
        .catch((error) => {
          if (
            error instanceof Error &&
            error.message === "recursion depth exceeded"
          ) {
            toastr.error(t("Common:SizeImageLarge"));
          }
          return undefined;
        });
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:NotSupportedFormat"));
    }
  };
}

export default AvatarEditorDialogStore;
