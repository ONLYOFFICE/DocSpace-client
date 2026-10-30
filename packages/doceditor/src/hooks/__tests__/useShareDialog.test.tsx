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

import { FolderType } from "@docspace/shared/enums";

import type { IInitialConfig } from "@/types";

import useShareDialog from "../useShareDialog";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const formConfig = (encrypted: boolean) =>
  ({ startFilling: true, file: { id: 40, encrypted } }) as unknown as IInitialConfig;

describe("useShareDialog", () => {
  let root: Root | null = null;
  let dialog: ReturnType<typeof useShareDialog>;

  const render = (config: IInitialConfig) => {
    const openShareFormDialog = vi.fn();
    const Probe = () => {
      dialog = useShareDialog(config, openShareFormDialog, FolderType.Rooms);
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
    return openShareFormDialog;
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Form opened in a private room: the sharing request opens the sharing dialog, not the share-to-fill-out one", () => {
    const openShareFormDialog = render(formConfig(true));

    act(() => dialog.onSDKRequestSharingSettings());

    expect(openShareFormDialog).not.toHaveBeenCalled();
    expect(dialog.isSharingDialogVisible).toBe(true);
  });

  it("Form opened outside a private room: the sharing request opens the share-to-fill-out dialog", () => {
    const openShareFormDialog = render(formConfig(false));

    act(() => dialog.onSDKRequestSharingSettings());

    expect(openShareFormDialog).toHaveBeenCalledTimes(1);
    expect(dialog.isSharingDialogVisible).toBe(false);
  });
});
