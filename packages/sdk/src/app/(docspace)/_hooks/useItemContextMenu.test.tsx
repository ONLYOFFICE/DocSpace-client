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

import type { TFile } from "@docspace/shared/api/files/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock("../_store/FilesSettingsStore", () => ({
  useFilesSettingsStore: () => ({ filesSettings: {} }),
}));

import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";
import useItemContextMenu from "./useItemContextMenu";

const file = (overrides: Partial<TFile>) =>
  ({
    id: 1,
    title: "5f0c9a52.txt",
    fileExst: ".txt",
    canShare: false,
    viewAccessibility: {},
    security: { Read: true, Download: true, Copy: false, Move: true },
    ...overrides,
  }) as TFile;

describe("useItemContextMenu in a private room", () => {
  let root: Root | null = null;
  let menu: ReturnType<typeof useItemContextMenu>;

  const Probe = () => {
    menu = useItemContextMenu({ isPrivate: true, withoutFavorite: true });
    return null;
  };

  beforeEach(() => {
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Copy offered for an encrypted file", () => {
    expect(menu.getFilesContextMenu(file({ encrypted: true }))).toContain(
      AVAILABLE_CONTEXT_ITEMS.copy,
    );
  });

  it("follows the Copy right for a file that is not encrypted", () => {
    expect(menu.getFilesContextMenu(file({}))).not.toContain(
      AVAILABLE_CONTEXT_ITEMS.copy,
    );
  });
});
