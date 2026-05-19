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

import { SettingsStoreContextProvider } from "@/app/(docspace)/_store/SettingsStore";
import { FilesSettingsStoreContextProvider } from "@/app/(docspace)/_store/FilesSettingsStore";
import { FilesSelectionStoreContextProvider } from "@/app/(docspace)/_store/FilesSelectionStore";
import { FilesListStoreContextProvider } from "@/app/(docspace)/_store/FilesListStore";
import { NavigationStoreContextProvider } from "@/app/(docspace)/_store/NavigationStore";
import { MediaViewerStoreContextProvider } from "@/app/(docspace)/_store/MediaViewerStore";
import { DialogsStoreContextProvider } from "@/app/(docspace)/_store/DialogsStore";
import { DownloadDialogStoreContextProvider } from "@/app/(docspace)/_store/DownloadDialogStore";
import { ActiveItemsStoreContextProvider } from "@/app/(docspace)/_store/ActiveItemsStore";

import type { TViewAs } from "@docspace/shared/types";

import { DocsSettingsStoreContextProvider } from "./DocsSettingsStore";
import { DocsUserStoreContextProvider } from "./DocsUserStore";
import { InfoPanelStoreContextProvider } from "./InfoPanelStore";

export const DocsStoreProviders = ({
  children,
  initViewAs = "row",
}: {
  children: React.ReactNode;
  initViewAs?: TViewAs;
}) => {
  return (
    <SettingsStoreContextProvider initData={{ viewAs: initViewAs }}>
      <FilesSettingsStoreContextProvider>
        <FilesListStoreContextProvider>
          <FilesSelectionStoreContextProvider>
            <NavigationStoreContextProvider>
              <MediaViewerStoreContextProvider>
                <DialogsStoreContextProvider>
                  <DownloadDialogStoreContextProvider>
                    <ActiveItemsStoreContextProvider>
                      <DocsSettingsStoreContextProvider>
                        <DocsUserStoreContextProvider>
                          <InfoPanelStoreContextProvider>
                            {children}
                          </InfoPanelStoreContextProvider>
                        </DocsUserStoreContextProvider>
                      </DocsSettingsStoreContextProvider>
                    </ActiveItemsStoreContextProvider>
                  </DownloadDialogStoreContextProvider>
                </DialogsStoreContextProvider>
              </MediaViewerStoreContextProvider>
            </NavigationStoreContextProvider>
          </FilesSelectionStoreContextProvider>
        </FilesListStoreContextProvider>
      </FilesSettingsStoreContextProvider>
    </SettingsStoreContextProvider>
  );
};
