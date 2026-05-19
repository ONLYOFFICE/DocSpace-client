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

import React from "react";
import type { TFunction } from "i18next";
import { makeAutoObservable } from "mobx";
import resizeImage from "resize-image";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import {
  ONE_MEGABYTE,
  COMPRESSION_RATIO,
  NO_COMPRESSION_RATIO,
} from "@docspace/shared/constants";
import type { Nullable } from "@docspace/shared/types";

export type UploadedLogoResponse = {
  responseData: { data: string };
};

export type TImageState = {
  uploadedFile: Nullable<File>;
  x: number;
  y: number;
  zoom: number;
};

// Port of client AvatarEditorDialogStore — manages uploaded avatar file +
// image-cropper state + visibility flag for the editor modal.
class AvatarEditorStore {
  uploadedFile: Nullable<File> = null;

  image: TImageState = {
    uploadedFile: null,
    x: 0.5,
    y: 0.5,
    zoom: 1,
  };

  avatarEditorDialogVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  setUploadedFile = (file: Nullable<File>) => {
    this.uploadedFile = file;
  };

  clearUploadedFile = () => {
    this.uploadedFile = null;
  };

  setImage = (image: TImageState) => {
    this.image = { ...image, uploadedFile: this.uploadedFile };
  };

  setAvatarEditorDialogVisible = (visible: boolean) => {
    this.avatarEditorDialogVisible = visible;
  };

  // Legacy aliases — kept for the previous SDK callers (CreateEditAgentStore).
  clear = () => {
    this.uploadedFile = null;
  };

  getUploadedLogoData = async (): Promise<UploadedLogoResponse> => {
    if (!this.uploadedFile) {
      throw new Error("No file uploaded");
    }

    // Match the client AvatarEditorDialogStore.getUploadedLogoData payload
    // shape — key is "0", not "file" (server multipart expects indexed keys).
    const formData = new FormData();
    formData.append("0", this.uploadedFile);

    const responseData = await api.rooms.uploadRoomLogo(formData);

    // Mirror client: reset image+file after upload so a subsequent edit
    // does not double-submit the same buffer.
    this.setImage({ uploadedFile: null, x: 0.5, y: 0.5, zoom: 1 });
    this.setUploadedFile(null);

    return {
      responseData: responseData as { data: string },
    };
  };

  onChangeFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    t: TFunction,
  ) => {
    const uploadedFile = await this.uploadFile(t, e);
    this.setImage({ ...this.image, uploadedFile: uploadedFile ?? null });
  };

  uploadFile = async (
    t: TFunction,
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<File | undefined> => {
    const files = (await getFilesFromEvent(e)) as File[];
    const uploadedFile = await this.uploadFileToImageEditor(t, files[0]);

    if (uploadedFile) {
      this.setUploadedFile(uploadedFile);
      this.setImage({ ...this.image, uploadedFile });
      this.setAvatarEditorDialogVisible(true);
    }

    return uploadedFile;
  };

  // Compress recursively until the file fits under ONE_MEGABYTE — port of
  // client AvatarEditorDialogStore.resizeRecursiveAsync.
  private resizeRecursiveAsync = async (
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
      .then(
        (blob) =>
          new File([blob], "File name", {
            type: "image/jpg",
          }),
      );

    if (file.size < ONE_MEGABYTE) return file;

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

  private uploadFileToImageEditor = async (
    t: TFunction,
    file: File,
  ): Promise<File | undefined> => {
    let imageBitMap: ImageBitmap | undefined;
    try {
      imageBitMap = await createImageBitmap(file);

      const width = imageBitMap.width;
      const height = imageBitMap.height;

      const canvas = resizeImage.resize2Canvas(imageBitMap, width, height);

      return await this.resizeRecursiveAsync(
        { width, height },
        canvas,
        file.size > ONE_MEGABYTE ? COMPRESSION_RATIO : NO_COMPRESSION_RATIO,
      )
        .then((f) => {
          if (f instanceof File) return f;
          return undefined;
        })
        .catch((error: unknown) => {
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
      return undefined;
    } finally {
      // Release the decoded bitmap from memory once we are done with it
      // (the canvas already holds a copy of the pixel data).
      imageBitMap?.close();
    }
  };
}

const AvatarEditorStoreContext =
  React.createContext<AvatarEditorStore | null>(null);

export const AvatarEditorStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AvatarEditorStore(), []);
  return (
    <AvatarEditorStoreContext.Provider value={store}>
      {children}
    </AvatarEditorStoreContext.Provider>
  );
};

export const useAvatarEditorStore = () => {
  const store = React.useContext(AvatarEditorStoreContext);
  if (!store)
    throw new Error(
      "useAvatarEditorStore must be used within AvatarEditorStoreContextProvider",
    );
  return store;
};

export default AvatarEditorStore;
