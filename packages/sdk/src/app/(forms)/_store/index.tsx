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

import { Provider } from "mobx-react";

import store from "@/app/(docspace)/_store";
import { SettingsStoreContextProvider } from "@/app/(docspace)/_store/SettingsStore";
import { FilesSettingsStoreContextProvider } from "@/app/(docspace)/_store/FilesSettingsStore";
import { FilesSelectionStoreContextProvider } from "@/app/(docspace)/_store/FilesSelectionStore";
import { FilesListStoreContextProvider } from "@/app/(docspace)/_store/FilesListStore";
import { NavigationStoreContextProvider } from "@/app/(docspace)/_store/NavigationStore";
import { MediaViewerStoreContextProvider } from "@/app/(docspace)/_store/MediaViewerStore";
import { DialogsStoreContextProvider } from "@/app/(docspace)/_store/DialogsStore";
import { DownloadDialogStoreContextProvider } from "@/app/(docspace)/_store/DownloadDialogStore";
import { ActiveItemsStoreContextProvider } from "@/app/(docspace)/_store/ActiveItemsStore";

import { FormsNavigationStoreContextProvider } from "./FormsNavigationStore";
// LibraryNavigationStore removed — library uses URL routing
import { FormsListStoreContextProvider } from "./FormsListStore";
import { FormsSettingsStoreContextProvider } from "./FormsSettingsStore";
import { FormsDbSettingsStoreContextProvider } from "./FormsDbSettingsStore";
import { FormsAiAgentStoreContextProvider } from "./FormsAiAgentStore";
import { FormsUserStoreContextProvider } from "./FormsUserStore";

export const FormsStoreProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Provider {...store}>
      <SettingsStoreContextProvider initData={{ viewAs: "tile" }}>
        <FilesSettingsStoreContextProvider>
          <FilesListStoreContextProvider>
            <FilesSelectionStoreContextProvider>
              <NavigationStoreContextProvider>
                <MediaViewerStoreContextProvider>
                  <DialogsStoreContextProvider>
                    <DownloadDialogStoreContextProvider>
                      <ActiveItemsStoreContextProvider>
                        <FormsSettingsStoreContextProvider>
                          <FormsUserStoreContextProvider>
                            <FormsDbSettingsStoreContextProvider>
                              <FormsAiAgentStoreContextProvider>
                                <FormsNavigationStoreContextProvider>
                                    <FormsListStoreContextProvider>
                                      {children}
                                    </FormsListStoreContextProvider>
                                </FormsNavigationStoreContextProvider>
                              </FormsAiAgentStoreContextProvider>
                            </FormsDbSettingsStoreContextProvider>
                          </FormsUserStoreContextProvider>
                        </FormsSettingsStoreContextProvider>
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
