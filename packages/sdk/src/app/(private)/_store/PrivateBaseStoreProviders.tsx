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

// PARITY-SOURCE: packages/sdk/src/app/(personal-files)/_store/index.tsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko
// NOTE: Fork of DocsStoreProviders with the same store list — but explicit so
// (private) doesn't silently inherit future additions from (personal-files).
// VersionHistoryStore was originally planned to be dropped (SDK_PRIVATE_PLAN
// §6.1 — version history out-of-scope for private rooms) but is kept because
// `(personal-files)/_components/docs-layout` reads it unconditionally. Hide
// version-history UI at the layout/menu level instead of the store level.

"use client";

import React from "react";

import type { TViewAs } from "@docspace/shared/types";

import { SettingsStoreContextProvider } from "@/app/(docspace)/_store/SettingsStore";
import { FilesSettingsStoreContextProvider } from "@/app/(docspace)/_store/FilesSettingsStore";
import { FilesSelectionStoreContextProvider } from "@/app/(docspace)/_store/FilesSelectionStore";
import { FilesListStoreContextProvider } from "@/app/(docspace)/_store/FilesListStore";
import { NavigationStoreContextProvider } from "@/app/(docspace)/_store/NavigationStore";
import { MediaViewerStoreContextProvider } from "@/app/(docspace)/_store/MediaViewerStore";
import { DialogsStoreContextProvider } from "@/app/(docspace)/_store/DialogsStore";
import { DownloadDialogStoreContextProvider } from "@/app/(docspace)/_store/DownloadDialogStore";
import { ActiveItemsStoreContextProvider } from "@/app/(docspace)/_store/ActiveItemsStore";
import { UploadStoreContextProvider } from "@/app/(docspace)/_store/UploadStore";
import { InfoPanelStoreContextProvider } from "@/app/(docspace)/_store/InfoPanelStore";
import { DocsSettingsStoreContextProvider } from "@/app/(personal-files)/_store/DocsSettingsStore";
import { DocsUserStoreContextProvider } from "@/app/(personal-files)/_store/DocsUserStore";
import { VersionHistoryStoreContextProvider } from "@/app/(personal-files)/_store/VersionHistoryStore";

export const PrivateBaseStoreProviders = ({
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
                      <UploadStoreContextProvider>
                        <DocsSettingsStoreContextProvider>
                          <DocsUserStoreContextProvider>
                            <InfoPanelStoreContextProvider>
                              <VersionHistoryStoreContextProvider>
                                {children}
                              </VersionHistoryStoreContextProvider>
                            </InfoPanelStoreContextProvider>
                          </DocsUserStoreContextProvider>
                        </DocsSettingsStoreContextProvider>
                      </UploadStoreContextProvider>
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
