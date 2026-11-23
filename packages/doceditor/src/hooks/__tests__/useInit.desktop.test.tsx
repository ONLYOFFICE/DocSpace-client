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

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TUser } from "@docspace/shared/api/people/types";

import type { IInitialConfig, UseInitProps } from "@/types";

const { keys, initDesktop } = vi.hoisted(() => ({
  keys: { ready: false, loaded: null as null | { id: string }[] },
  initDesktop: vi.fn(),
}));

vi.mock("@/utils/constants", () => ({ IS_DESKTOP_EDITOR: true }));
vi.mock("@/utils/initDesktop", () => ({ default: initDesktop }));
vi.mock("@/utils", () => ({
  setDocumentTitle: vi.fn(),
  showDocEditorMessage: vi.fn(),
}));
vi.mock("@docspace/shared/hooks/useResolvedFileTitle", () => ({
  useResolvedFileTitle: () => "",
}));
vi.mock("@/components/EncryptionProviderWrapper", () => ({
  useEncryptionKeysReady: () => keys.ready,
  useLoadedEncryptionKeys: () => keys.loaded,
}));

import useInit from "../useInit";

const user = { id: "user-1" } as TUser;
const FILE_ID = 7;

const configOf = (encrypted: boolean) =>
  ({
    file: { id: FILE_ID, encrypted },
    document: { title: "a.docx", fileType: "docx" },
  }) as unknown as IInitialConfig;

describe("useInit in the desktop application", () => {
  let root: Root | null = null;
  let config = configOf(true);

  const Probe = () => {
    useInit({
      config,
      user,
      fileInfo: { id: FILE_ID },
      t: null,
      setDocTitle: vi.fn(),
    } as unknown as UseInitProps);
    return null;
  };

  const render = () => {
    root ??= createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  beforeEach(() => {
    keys.ready = false;
    keys.loaded = null;
    config = configOf(true);
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("registers an encrypted file once its key set has been read", () => {
    render();
    expect(initDesktop).not.toHaveBeenCalled();

    keys.ready = true;
    keys.loaded = [{ id: "key-1" }];
    render();

    expect(initDesktop).toHaveBeenCalledTimes(1);
    expect(initDesktop).toHaveBeenCalledWith(keys.loaded, user, FILE_ID, null);
  });

  it("registers a file that is not encrypted at once, without a key pair", () => {
    config = configOf(false);

    render();

    expect(initDesktop).toHaveBeenCalledTimes(1);
    expect(initDesktop).toHaveBeenCalledWith(null, user, FILE_ID, null);
  });

  it("does not register again when the key set is read again", () => {
    keys.ready = true;
    keys.loaded = [{ id: "key-1" }];
    render();

    keys.ready = false;
    keys.loaded = null;
    render();
    keys.ready = true;
    keys.loaded = [{ id: "key-2" }];
    render();

    expect(initDesktop).toHaveBeenCalledTimes(1);
  });
});
