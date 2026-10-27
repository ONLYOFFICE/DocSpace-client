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
import { observable, runInAction } from "mobx";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "@docspace/shared/enums";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  uploads: null as { count: number } | null,
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("../../_store/PrivateEncryptedUploadStore", () => ({
  useActiveEncryptedUploadsForRoom: () => mocks.uploads!.count,
}));

import {
  PrivateDialogsStoreProvider,
  usePrivateDialogsStore,
} from "../../_store/PrivateDialogsStore";
import PrivateMemberUser from "./PrivateMemberUser";

describe("PrivateMemberUser removal", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;
  let dialogs: ReturnType<typeof usePrivateDialogsStore>;

  const DialogsProbe = () => {
    dialogs = usePrivateDialogsStore();
    return null;
  };

  const render = () => {
    container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <PrivateDialogsStoreProvider>
          <DialogsProbe />
          <PrivateMemberUser
            roomId={10}
            userId="bob"
            displayName="Bob"
            access={ShareAccessRights.Editing}
            canChangeRole={false}
            canRemove
            isOwner={false}
          />
        </PrivateDialogsStoreProvider>,
      ),
    );
  };

  const clickRemove = () =>
    act(() => {
      container
        .querySelector<HTMLElement>(
          '[data-testid="private_member_remove_button"]',
        )
        ?.click();
    });

  beforeEach(() => {
    mocks.uploads = observable({ count: 1 });
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Uploads in flight", () => {
    render();

    clickRemove();

    expect(mocks.toastr.warning).toHaveBeenCalledWith(
      "Common:CannotRemoveMemberWhileUploads",
    );
    expect(dialogs.removeUser).toBeNull();
  });

  it("offers the removal once the uploads have finished", () => {
    render();

    act(() => {
      runInAction(() => {
        mocks.uploads!.count = 0;
      });
    });
    clickRemove();

    expect(mocks.toastr.warning).not.toHaveBeenCalled();
    expect(dialogs.removeUser).toEqual(
      expect.objectContaining({ roomId: 10, userId: "bob" }),
    );
  });
});
