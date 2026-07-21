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

import { describe, it, expect, vi } from "vitest";

// Partial-mock the helper modules these thin delegators call. vi.mock is
// scoped to this file, so the builder specs (which use the real helpers) are
// unaffected.
vi.mock("../helpers", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  onClickEditRoom: vi.fn(),
  onShowInfoPanel: vi.fn(),
  onShowEditingToast: vi.fn(),
}));
vi.mock("SRC_DIR/helpers/info-panel", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  openShareTab: vi.fn(),
}));
vi.mock("@docspace/shared/services/xlsx-update.service", () => ({
  XlsxUpdateService: { start: vi.fn(async () => null) },
}));

import {
  onClickEditRoom as onClickEditRoomHelper,
  onShowInfoPanel as onShowInfoPanelHelper,
  onShowEditingToast,
} from "../helpers";
import { openShareTab } from "SRC_DIR/helpers/info-panel";
import { XlsxUpdateService } from "@docspace/shared/services/xlsx-update.service";

import { createTestContextOptionsStore, t } from "./testHarness";

const item = (over: Record<string, unknown> = {}) =>
  ({ id: 1, isFolder: false, fileExst: ".docx", ...over }) as never;

describe("ContextOptionsStore — helper-delegating handlers", () => {
  it("onShowInfoPanel -> helper", () => {
    const store = createTestContextOptionsStore();
    store.onShowInfoPanel(item(), "info");
    expect(onShowInfoPanelHelper).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      "info",
    );
  });

  it("onClickEditRoom -> helper", () => {
    const store = createTestContextOptionsStore();
    store.onClickEditRoom(item());
    expect(onClickEditRoomHelper).toHaveBeenCalledTimes(1);
  });

  it("onClickShare -> openShareTab", () => {
    const store = createTestContextOptionsStore();
    store.onClickShare(item());
    expect(openShareTab).toHaveBeenCalledTimes(1);
  });

  it("onDelete on an editing item shows the editing toast (no delete)", () => {
    const store = createTestContextOptionsStore();
    store.onDelete(item({ isEditing: true }), t);
    expect(onShowEditingToast).toHaveBeenCalledTimes(1);
  });

  it("onSyncXlsxData -> XlsxUpdateService.start", async () => {
    const store = createTestContextOptionsStore({
      filesActionsStore: {
        uploadDataStore: {
          secondaryProgressDataStore: {
            clearSecondaryProgressData: vi.fn(),
            setSecondaryProgressBarData: vi.fn(),
          },
        },
      },
    });
    await store.onSyncXlsxData(item(), t);
    expect(XlsxUpdateService.start).toHaveBeenCalledTimes(1);
  });

  it("onMultiLoadPlugins / onLoadPlugins return an array", () => {
    const store = createTestContextOptionsStore();
    expect(Array.isArray(store.onMultiLoadPlugins([item()]))).toBe(true);
    expect(
      Array.isArray(store.onLoadPlugins(item({ contextOptions: [] }))),
    ).toBe(true);
  });
});
