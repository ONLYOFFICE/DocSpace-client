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
import { makeAutoObservable, toJS } from "mobx";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { LinkParamsType } from "@docspace/shared/types";

class InfoPanelStore {
  isVisible: boolean = false;
  selection: TFile | TFolder | null = null;
  shareChanged: boolean = false;

  editLinkPanelIsVisible: boolean = false;
  linkParams: LinkParamsType | null = null;
  embeddingPanelData: { visible: boolean; item?: TFile | TFolder } | null =
    null;

  constructor() {
    makeAutoObservable(this);
  }

  open = (item: TFile | TFolder) => {
    this.selection = toJS(item);
    this.isVisible = true;
  };

  close = () => {
    this.isVisible = false;
    this.selection = null;
    this.shareChanged = false;
  };

  toggle = () => {
    this.isVisible = !this.isVisible;
  };

  setShareChanged = (changed: boolean) => {
    this.shareChanged = changed;
  };

  setEditLinkPanelIsVisible = (visible: boolean) => {
    this.editLinkPanelIsVisible = visible;
  };

  setLinkParams = (params: LinkParamsType | null) => {
    this.linkParams = params;
  };

  setEmbeddingPanelData = (data: {
    visible: boolean;
    item?: TFile | TFolder;
  }) => {
    this.embeddingPanelData = data;
  };
}

export const InfoPanelStoreContext = React.createContext<InfoPanelStore>(
  null as unknown as InfoPanelStore,
);

export const InfoPanelStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new InfoPanelStore(), []);
  return (
    <InfoPanelStoreContext.Provider value={store}>
      {children}
    </InfoPanelStoreContext.Provider>
  );
};

export const useInfoPanelStore = () => {
  const store = React.useContext(InfoPanelStoreContext);
  if (!store) {
    throw new Error(
      "useInfoPanelStore must be used within an InfoPanelStoreContextProvider",
    );
  }
  return store;
};
