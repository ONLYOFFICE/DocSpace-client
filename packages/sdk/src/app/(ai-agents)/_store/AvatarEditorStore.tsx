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
import { makeAutoObservable } from "mobx";

import api from "@docspace/shared/api";
import type { Nullable } from "@docspace/shared/types";

export type UploadedLogoResponse = {
  responseData: { data: string };
};

class AvatarEditorStore {
  uploadedFile: Nullable<File> = null;

  previewImage: Nullable<string> = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUploadedFile = (file: Nullable<File>) => {
    this.uploadedFile = file;

    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage);
    }
    this.previewImage = file ? URL.createObjectURL(file) : null;
  };

  clear = () => {
    if (this.previewImage) URL.revokeObjectURL(this.previewImage);
    this.uploadedFile = null;
    this.previewImage = null;
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

    return {
      responseData: responseData as { data: string },
    };
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
