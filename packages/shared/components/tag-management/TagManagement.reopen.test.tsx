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

import { TagManagementPopup } from "./TagManagement.popup";
import { applyTagChangeToRoomTags } from "./TagManagement.utils";
import type { TagChange, AccessTagManagement } from "./TagManagement.types";

const { getTags, addTagsToRoom } = vi.hoisted(() => ({
  getTags: vi.fn(() => Promise.resolve<string[]>([])),
  addTagsToRoom: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../api/rooms", () => ({
  getTags,
  addTagsToRoom,
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
  updateTagName: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../utils/useClickOutside", () => ({
  useClickOutside: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), success: vi.fn() },
}));

const ROOM_ID = "room-1";

const fullAccess: AccessTagManagement = {
  canBindTag: true,
  canCreate: true,
  canSearch: true,
  canEdit: true,
  canRemove: true,
};

const isChecked = (label: string) =>
  screen
    .getByTestId(`tag_checkbox_${label}`)
    .querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked;

// A host as small as it can be: it keeps the room's tags and applies whatever
// the popup tells it, which is what every real host does through its stores.
const Host = ({
  queryClient,
  roomTags,
}: {
  queryClient: QueryClient;
  roomTags: string[];
}) => {
  const [tags, setTags] = React.useState(roomTags);

  const onTagsChanged = React.useCallback((change: TagChange) => {
    setTags((prev) => applyTagChangeToRoomTags(prev, change));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TagManagementPopup
        tags={tags}
        roomId={ROOM_ID}
        onClose={vi.fn()}
        anchor={{ current: document.createElement("div") }}
        access={fullAccess}
        roomName="Room"
        confirmEditTag={() => Promise.resolve(true)}
        confirmDeleteTag={() => Promise.resolve(true)}
        onTagsChanged={onTagsChanged}
      />
    </QueryClientProvider>
  );
};

describe("opening the list again", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a tag bound before the list was closed as bound", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    getTags.mockResolvedValue(["tagA"]);

    const first = render(<Host queryClient={queryClient} roomTags={[]} />);

    await screen.findByTestId("tag_item_tagA");
    expect(isChecked("tagA")).toBe(false);

    await userEvent.click(screen.getByTestId("tag_row_tagA"));

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["tagA"]);
    });

    // Closed and opened again, with the room as the host now knows it.
    first.unmount();

    render(<Host queryClient={queryClient} roomTags={["tagA"]} />);

    await screen.findByTestId("tag_item_tagA");

    await waitFor(() => {
      expect(isChecked("tagA")).toBe(true);
    });
  });
});

