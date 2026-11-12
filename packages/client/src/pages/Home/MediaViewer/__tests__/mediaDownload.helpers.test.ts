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
import { describe, expect, it } from "vitest";

import { resolveMediaDownload } from "../mediaDownload.helpers";

const CIPHERTEXT_URL = "/api/2.0/files/file/8/download";
const encryptedItem = { fileId: 8, src: CIPHERTEXT_URL, encrypted: true };
const plainItem = { fileId: 9, src: "/storage/picture.png" };
const playlist = [encryptedItem, plainItem];

describe("resolveMediaDownload", () => {
  it("Download from the media viewer", () => {
    const listed = { id: 8, title: "photo.png" };

    expect(
      resolveMediaDownload({ id: 8, playlist, files: [listed] }),
    ).toEqual({ kind: "decrypt", file: listed });
  });

  it("Download of the previewed file that is not in the folder list", () => {
    const previewFile = { id: "8", title: "photo.png" };

    expect(
      resolveMediaDownload({ id: 8, playlist, files: [], previewFile }),
    ).toEqual({ kind: "decrypt", file: previewFile });
  });

  it("Download from the media viewer of a file that cannot be found", () => {
    const result = resolveMediaDownload({
      id: 8,
      playlist,
      files: [{ id: 9, title: "picture.png" }],
      previewFile: { id: 10, title: "other.png" },
    });

    expect(result).toEqual({ kind: "missing" });
    expect(JSON.stringify(result)).not.toContain(CIPHERTEXT_URL);
  });

  it("Download of a file that is not encrypted", () => {
    expect(resolveMediaDownload({ id: 9, playlist, files: [] })).toEqual({
      kind: "plain",
      src: "/storage/picture.png",
    });
  });

  it("File outside the playlist", () => {
    expect(resolveMediaDownload({ id: 11, playlist, files: [] })).toEqual({
      kind: "none",
    });
  });
});
