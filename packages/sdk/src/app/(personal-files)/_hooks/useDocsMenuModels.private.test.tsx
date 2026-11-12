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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { info: vi.fn() },
}));

vi.mock("@/providers/SdkCustomActionsProvider", () => ({
  useSdkCustomActions: () => ({ customActions: undefined }),
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => ({ rootFolderType: 14, currentFolder: { id: 15 } }),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useDocsMenuModels } from "./useDocsMenuModels";
import type { TPrivateCreate } from "./useDocsActions";

describe("useDocsMenuModels in a private room", () => {
  let root: Root | null = null;
  let models: ReturnType<typeof useDocsMenuModels>;
  const openCreateDialog = vi.fn();

  const render = (privateCreate: TPrivateCreate) => {
    const Probe = () => {
      models = useDocsMenuModels({
        openCreateDialog,
        onUploadFiles: vi.fn(),
        onUploadFolder: vi.fn(),
        privateCreate,
      });
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    openCreateDialog.mockClear();
  });

  const keys = (items: { key?: unknown }[]) => items.map((item) => item.key);

  it("Create menu opened", () => {
    render({ canCreateFiles: true });

    expect(keys(models.desktopModel)).toEqual([
      "docx",
      "xlsx",
      "pptx",
      "pdf",
      "new-folder",
      "separator-1",
      "upload-files",
    ]);
    expect(models.quickActionItems.map((item) => item.id)).toEqual([
      "quick-docx",
      "quick-xlsx",
      "quick-pptx",
      "quick-pdf",
    ]);
  });

  it("Create menu opened without keys", () => {
    render({ canCreateFiles: false });

    expect(keys(models.desktopModel)).toEqual([
      "new-folder",
      "separator-1",
      "upload-files",
    ]);
    expect(keys(models.actionOptions)).toEqual(["new-folder"]);
    expect(models.quickActionItems).toEqual([]);
  });

  it("PDF form from the mobile main button", () => {
    render({ canCreateFiles: true });

    const pdf = models.actionOptions.find((option) => option.key === "pdf");
    act(() => pdf?.onClick?.({} as never));

    expect(toastr.info).toHaveBeenCalledWith(
      "Common:MobileEditPdfNotAvailableInfo",
    );
    expect(openCreateDialog).not.toHaveBeenCalled();
  });
});
