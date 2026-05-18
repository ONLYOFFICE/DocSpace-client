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

type OpenParams = {
  formId: number;
  onConfirm: () => Promise<void>;
};

class FormsStopFillingDialogStore {
  visible: boolean = false;
  isLoading: boolean = false;
  formId: number | null = null;
  private onConfirm: (() => Promise<void>) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  open = ({ formId, onConfirm }: OpenParams) => {
    this.formId = formId;
    this.onConfirm = onConfirm;
    this.isLoading = false;
    this.visible = true;
  };

  close = () => {
    if (this.isLoading) return;
    this.visible = false;
    this.formId = null;
    this.onConfirm = null;
  };

  confirm = async () => {
    if (!this.onConfirm || this.isLoading) return;
    this.isLoading = true;
    try {
      await this.onConfirm();
      this.visible = false;
      this.formId = null;
      this.onConfirm = null;
    } finally {
      this.isLoading = false;
    }
  };
}

const FormsStopFillingDialogStoreContext =
  React.createContext<FormsStopFillingDialogStore | null>(null);

export const FormsStopFillingDialogStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsStopFillingDialogStore(), []);
  return (
    <FormsStopFillingDialogStoreContext.Provider value={store}>
      {children}
    </FormsStopFillingDialogStoreContext.Provider>
  );
};

export const useFormsStopFillingDialogStore = () => {
  const store = React.useContext(FormsStopFillingDialogStoreContext);
  if (!store)
    throw new Error(
      "useFormsStopFillingDialogStore must be used within FormsStopFillingDialogStoreContextProvider",
    );
  return store;
};
