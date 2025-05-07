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

"use client";

import { Provider } from "mobx-react";

import type { TViewAs } from "@docspace/shared/types";

import store from "../../_store";
import { NavigationStoreContextProvider } from "../../_store/NavigationStore";
import { SettingsStoreContextProvider } from "../../_store/SettingsStore";
import { FilesSettingsStoreContextProvider } from "../../_store/FilesSettingsStore";
import { FilesSelectionStoreContextProvider } from "../../_store/FilesSelectionStore";
import { FilesListStoreContextProvider } from "../../_store/FilesListStore";
import { MediaViewerStoreContextProvider } from "../../_store/MediaViewerStore";
import { DialogsStoreContextProvider } from "../../_store/DialogsStore";
import { DownloadDialogStoreContextProvider } from "../../_store/DownloadDialogStore";
import { ActiveItemsStoreContextProvider } from "../../_store/ActiveItemsStore";

type LayoutProps = {
  children: React.ReactNode;
  initSettingsStoreData: { viewAs: TViewAs };
};

export const Layout = ({ children, initSettingsStoreData }: LayoutProps) => {
  return (
    <Provider {...store}>
      <SettingsStoreContextProvider initData={initSettingsStoreData}>
        <FilesSettingsStoreContextProvider>
          <FilesListStoreContextProvider>
            <FilesSelectionStoreContextProvider>
              <NavigationStoreContextProvider>
                <MediaViewerStoreContextProvider>
                  <DialogsStoreContextProvider>
                    <DownloadDialogStoreContextProvider>
                      <ActiveItemsStoreContextProvider>
                        {children}
                      </ActiveItemsStoreContextProvider>
                    </DownloadDialogStoreContextProvider>
                  </DialogsStoreContextProvider>
                </MediaViewerStoreContextProvider>
              </NavigationStoreContextProvider>
            </FilesSelectionStoreContextProvider>
          </FilesListStoreContextProvider>
        </FilesSettingsStoreContextProvider>
      </SettingsStoreContextProvider>
    </Provider>
  );
};
