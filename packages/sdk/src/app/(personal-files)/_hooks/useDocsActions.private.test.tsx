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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  keepNewFileName: true,
  items: [] as { id: number; title: string }[],
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key === "Common:NewPDFForm" ? "New form" : key.replace("Common:", ""),
  }),
}));

vi.mock("@docspace/shared/api/files", () => ({
  checkIsFileExist: vi.fn(),
  createFile: vi.fn(),
  createFolder: vi.fn(),
  startUploadSession: vi.fn(),
  uploadChunkSequential: vi.fn(),
  finalizeUploadSession: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

vi.mock("@/app/(docspace)/_store/NavigationStore", () => ({
  useNavigationStore: () => ({ currentFolderId: 15 }),
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => ({ items: env.items }),
}));

vi.mock("@/app/(docspace)/_store/FilesSettingsStore", () => ({
  useFilesSettingsStore: () => ({
    filesSettings: { keepNewFileName: env.keepNewFileName },
  }),
}));

vi.mock("@/app/(docspace)/_store/UploadStore", () => ({
  useUploadStore: () => ({}),
}));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({ sdkConfig: {} }),
}));

vi.mock("@/app/(docspace)/_utils/open-doc-editor", () => ({
  default: vi.fn(),
}));

import openDocEditor from "@/app/(docspace)/_utils/open-doc-editor";

import useDocsActions, { type TPrivateCreate } from "./useDocsActions";

describe("useDocsActions in a private room", () => {
  let root: Root | null = null;
  let actions: ReturnType<typeof useDocsActions>;
  const createFileOverride = vi.fn(async () => true);

  const render = (privateCreate: TPrivateCreate) => {
    const Probe = () => {
      actions = useDocsActions({ createFileOverride, privateCreate });
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  beforeEach(() => {
    env.keepNewFileName = true;
    env.items = [];
    createFileOverride.mockClear();
    vi.mocked(openDocEditor).mockClear();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("PDF form hotkey", async () => {
    render({ canCreateFiles: true });

    await act(async () => actions.openCreateDialog("pdf"));

    expect(createFileOverride).toHaveBeenCalledWith(15, "New form", "pdf");
    expect(openDocEditor).not.toHaveBeenCalled();
  });

  it("names a new file after the decrypted names already in the folder", async () => {
    env.items = [{ id: 1, title: "NewDocument.docx" }];
    render({ canCreateFiles: true });

    await act(async () => actions.openCreateDialog("docx"));

    expect(createFileOverride).toHaveBeenCalledWith(
      15,
      "NewDocument (1)",
      "docx",
    );
  });

  it("Create menu opened without keys", async () => {
    render({ canCreateFiles: false });

    await act(async () => actions.openCreateDialog("docx"));
    await act(async () => actions.openCreateDialog("pdf"));

    expect(createFileOverride).not.toHaveBeenCalled();
    expect(openDocEditor).not.toHaveBeenCalled();
    expect(actions.dialogVisible).toBe(false);
  });
});
