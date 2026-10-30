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

import type { TFile } from "@docspace/shared/api/files/types";

import type { IInitialConfig, UseEventsProps } from "@/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@docspace/shared/api/files", () => ({
  addFileToRecentlyViewed: vi.fn(),
  createFile: vi.fn(),
  getEditDiff: vi.fn(),
  getEditHistory: vi.fn(),
  getProtectUsers: vi.fn(),
  getReferenceData: vi.fn(),
  getSharedUsers: vi.fn(),
  openEdit: vi.fn(),
  restoreDocumentsVersion: vi.fn(),
  sendEditorNotify: vi.fn(),
  markAsFavorite: vi.fn(async () => undefined),
  removeFromFavorite: vi.fn(async () => undefined),
  manageFormFilling: vi.fn(),
}));

vi.mock("@docspace/shared/api/ai", () => ({
  getProfilesList: vi.fn(),
  getProfileAssignments: vi.fn(),
  getWebSearchConfigured: vi.fn(),
}));

vi.mock("@docspace/shared/utils/oauthToken", () => ({
  isOAuthFrame: () => false,
}));

vi.mock("@docspace/shared/constants", () => ({
  CREATED_FORM_KEY: "created-form",
  FILLING_STATUS_ID: "filling-status",
}));

vi.mock("@docspace/shared/utils/common", () => ({
  assign: vi.fn(),
  frameCallCommand: vi.fn(),
  frameCallEvent: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

vi.mock("@/utils", () => ({
  getCurrentDocumentVersion: vi.fn(),
  getDocEditor: vi.fn(() => undefined),
  getFormsSectionFolderUrl: vi.fn(),
  getSafeReturnUrl: vi.fn(),
  isFormRole: vi.fn(),
  isFormRoomFile: vi.fn(() => false),
  setDocumentTitle: vi.fn(),
  toFormsSectionUrl: vi.fn(),
}));

vi.mock("@/utils/events", () => ({ onSDKInfo: vi.fn() }));

vi.mock("@/utils/aiProxy", () => ({
  default: vi.fn(),
  abortAllRequests: vi.fn(),
}));

import { markAsFavorite, removeFromFavorite } from "@docspace/shared/api/files";

import useEditorEvents from "../useEditorEvents";

const fileInfo = (encrypted: boolean) =>
  ({ id: 7, encrypted, isFavorite: false }) as unknown as TFile;

const config = {
  documentType: "word",
  document: { fileType: "docx", referenceData: {} },
  editorConfig: { mode: "edit" },
} as unknown as IInitialConfig;

describe("useEditorEvents", () => {
  let root: Root | null = null;
  let events: ReturnType<typeof useEditorEvents>;

  const render = (props: Partial<UseEventsProps>) => {
    const Probe = () => {
      events = useEditorEvents({
        t: ((key: string) => key) as UseEventsProps["t"],
        openOnNewPage: false,
        organizationName: "",
        config,
        ...props,
      });
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  describe("onMetaChange", () => {
    it("Favorite toggled on an encrypted file: the change is ignored", async () => {
      render({ fileInfo: fileInfo(true) });

      await act(async () => {
        await events.onMetaChange({ data: { title: "Title", favorite: true } });
      });

      expect(markAsFavorite).not.toHaveBeenCalled();
      expect(removeFromFavorite).not.toHaveBeenCalled();
    });

    it("Favorite toggled on a plain file: the file is marked as favorite", async () => {
      render({ fileInfo: fileInfo(false) });

      await act(async () => {
        await events.onMetaChange({ data: { title: "Title", favorite: true } });
      });

      expect(markAsFavorite).toHaveBeenCalledWith([7], []);
    });
  });
});
