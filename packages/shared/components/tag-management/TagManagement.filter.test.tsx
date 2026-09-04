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

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TagManagementProvider } from "./TagManagement.provider";
import { TagManagementFilter } from "./TagManagement.filter";
import type { AccessTagManagement } from "./TagManagement.types";

const { addTagsToRoom, removeTagsFromRoom } = vi.hoisted(() => ({
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../api/rooms", () => ({
  addTagsToRoom,
  removeTagsFromRoom,
  getTags: vi.fn(() => Promise.resolve([])),
  updateTagName: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
}));

vi.mock("@docspace/ui-kit/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

const ROOM_ID = "room-1";

const fullAccess: AccessTagManagement = {
  canBindTag: true,
  canCreate: true,
  canSearch: true,
  canEdit: true,
  canRemove: true,
};

const renderFilter = (access: AccessTagManagement = fullAccess) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TagManagementProvider
        roomTags={["boundTag"]}
        fetchedTags={["boundTag", "freeTag"]}
        access={access}
      >
        <TagManagementFilter roomId={ROOM_ID} roomName="Room" />
      </TagManagementProvider>
    </QueryClientProvider>,
  );
};

const typeAndSubmit = async (value: string) => {
  const input = screen.getByTestId("add_tag_input");

  await userEvent.type(input, value);
  await userEvent.type(input, "{Enter}");
};

describe("<TagManagementFilter /> submitting the search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the tag when the name is new", async () => {
    renderFilter();

    await typeAndSubmit("brandNewTag");

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["brandNewTag"]);
    });
  });

  // The name of an existing tag means that tag, so Enter has to add it to the
  // room - it used to do nothing at all, since there was nothing to create.
  it("adds an existing tag to the room instead of doing nothing", async () => {
    renderFilter();

    await typeAndSubmit("freeTag");

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
    });
    expect(screen.getByTestId("add_tag_input")).toHaveValue("");
  });

  it("matches the name whatever its case, and keeps the tag's own spelling", async () => {
    renderFilter();

    await typeAndSubmit("FREETAG");

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
    });
  });

  it("sends nothing when the tag is already in the room", async () => {
    renderFilter();

    await typeAndSubmit("boundTag");

    await waitFor(() => {
      expect(screen.getByTestId("add_tag_input")).toHaveValue("");
    });
    expect(addTagsToRoom).not.toHaveBeenCalled();
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
  });

  it("sends nothing when the user may not add tags to the room", async () => {
    renderFilter({ ...fullAccess, canBindTag: false });

    await typeAndSubmit("freeTag");

    await waitFor(() => {
      expect(screen.getByTestId("add_tag_input")).toHaveValue("");
    });
    expect(addTagsToRoom).not.toHaveBeenCalled();
  });
});
