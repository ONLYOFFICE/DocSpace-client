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

import type { TRoom } from "@docspace/shared/api/rooms/types";

vi.mock("@docspace/ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));
vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (k: string) => k, exists: () => true, language: "en" },
}));
vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  createFile: vi.fn(async () => ({ id: 42 })),
}));

const CreateEditRoomStore = (await import("../CreateEditRoomStore")).default;
const { createFile } = await import("@docspace/shared/api/files");
const { toastr } = await import("@docspace/ui-kit/components/toast");

/** CreateEditRoomStore with only the deps createFormFromTemplate touches. */
const createStore = (oformsStore: Record<string, unknown>) => {
  const deps = Array.from({ length: 10 }, () => ({}));
  return new CreateEditRoomStore(
    ...([...deps, oformsStore] as unknown as ConstructorParameters<
      typeof CreateEditRoomStore
    >),
  );
};

const room = { id: 99 } as TRoom;

describe("CreateEditRoomStore.createFormFromTemplate", () => {
  it("creates the picked template inside the room and consumes it", async () => {
    const setFormTemplateForNewRoom = vi.fn();
    const store = createStore({
      formTemplateForNewRoom: { id: 7, title: "Form", extension: "pdf" },
      setFormTemplateForNewRoom,
    });

    await store.createFormFromTemplate(room);

    // Created straight into the room -- no staging folder, no copy.
    expect(createFile).toHaveBeenCalledWith(99, "Form.pdf", undefined, 7);
    // Consumed, so it cannot leak into the next room created.
    expect(setFormTemplateForNewRoom).toHaveBeenCalledWith(null);
  });

  it("does nothing when no template is pending", async () => {
    const store = createStore({
      formTemplateForNewRoom: null,
      setFormTemplateForNewRoom: vi.fn(),
    });

    await store.createFormFromTemplate(room);

    expect(createFile).not.toHaveBeenCalled();
  });

  it("reports a failed creation without blocking the room flow", async () => {
    (createFile as ReturnType<typeof vi.fn>).mockRejectedValueOnce("boom");
    const setFormTemplateForNewRoom = vi.fn();
    const store = createStore({
      formTemplateForNewRoom: { id: 7, title: "Form", extension: "pdf" },
      setFormTemplateForNewRoom,
    });

    // Resolves rather than throwing -- the room itself was already created.
    await expect(store.createFormFromTemplate(room)).resolves.toBeUndefined();
    expect(toastr.error).toHaveBeenCalledWith("boom");
    expect(setFormTemplateForNewRoom).toHaveBeenCalledWith(null);
  });
});
