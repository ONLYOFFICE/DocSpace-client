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
  frameCallEvent: vi.fn(),
  setMediaViewerData: vi.fn(),
  openFileOverride: vi.fn(),
}));

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallEvent: env.frameCallEvent,
}));

vi.mock("@docspace/shared/api", () => ({ default: {} }));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({
    sdkConfig: { events: { onFileManagerClick: "onFileManagerClick" } },
  }),
}));

vi.mock("@/app/(docspace)/_store/MediaViewerStore", () => ({
  useMediaViewerStore: () => ({ setMediaViewerData: env.setMediaViewerData }),
}));

vi.mock("../_store/FilesSettingsStore", () => ({
  useFilesSettingsStore: () => ({ filesSettings: {} }),
}));

vi.mock("../_store/FilesListStore", () => ({
  useFilesListStore: () => ({}),
}));

vi.mock("../_store/SettingsStore", () => ({
  useSettingsStore: () => ({ shareKey: undefined }),
}));

import { OpenFileContext } from "../_contexts/OpenFileContext";
import type { TFileItem } from "./useItemList";
import useFilesActions from "./useFilesActions";

const file = (encrypted: boolean) =>
  ({
    id: 9,
    title: "5f0c9a52.docx",
    encrypted,
    viewAccessibility: { ImageView: false, MediaView: false },
  }) as unknown as TFileItem;

describe("useFilesActions / openFile", () => {
  let root: Root | null = null;
  let actions: ReturnType<typeof useFilesActions>;

  beforeEach(() => {
    vi.clearAllMocks();
    const Probe = () => {
      actions = useFilesActions({ t: (key: string) => key });
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <OpenFileContext.Provider value={env.openFileOverride}>
          <Probe />
        </OpenFileContext.Provider>,
      ),
    );
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Host subscribed to file clicks, encrypted file", () => {
    const encrypted = file(true);

    act(() => actions.openFile(encrypted));

    expect(env.frameCallEvent).not.toHaveBeenCalled();
    expect(env.openFileOverride).toHaveBeenCalledWith(encrypted, false);
  });

  it("Host subscribed to file clicks, file not encrypted", () => {
    const plain = file(false);

    act(() => actions.openFile(plain));

    expect(env.frameCallEvent).toHaveBeenCalledWith({
      event: "onFileManagerClick",
      data: plain,
    });
    expect(env.openFileOverride).not.toHaveBeenCalled();
    expect(env.setMediaViewerData).not.toHaveBeenCalled();
  });
});
