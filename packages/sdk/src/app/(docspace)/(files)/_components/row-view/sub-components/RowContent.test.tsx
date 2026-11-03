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
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("@/app/(docspace)/_hooks/useFolderActions", () => ({
  default: () => ({ openFolder: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_hooks/useFilesActions", () => ({
  default: () => ({ openFile: vi.fn() }),
}));

import {
  clearEncryptedFilenameCache,
  rememberEncryptedFilename,
} from "@docspace/shared/services/encryption/filename-cache";

import { RowContent } from "./RowContent";

const ENCRYPTED_FILE = {
  id: 7,
  title: "c2VhbGVk.docx",
  fileExst: ".docx",
  encrypted: true,
  isFolder: false,
  createdBy: { displayName: "Ann" },
  created: "2026-10-28T10:00:00.000Z",
  updated: "2026-10-28T10:00:00.000Z",
};

describe("RowContent of an encrypted file", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    clearEncryptedFilenameCache();
  });

  it("Name recovered: the row shows the decrypted name once the file name cache holds it", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <RowContent
          item={ENCRYPTED_FILE as never}
          filterSortBy={null}
          timezone="UTC"
          displayFileExtension
        />,
      ),
    );
    expect(container.textContent).toContain("c2VhbGVk");

    act(() => rememberEncryptedFilename(7, "Quarterly report.docx"));

    expect(container.textContent).toContain("Quarterly report");
    expect(container.textContent).not.toContain("c2VhbGVk");
  });
});
