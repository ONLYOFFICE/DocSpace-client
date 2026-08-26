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

import { TagManagement } from "./TagManagement";
import {
  EDIT_TAG_DONT_SHOW_AGAIN_KEY,
  DELETE_TAG_DONT_SHOW_AGAIN_KEY,
} from "./TagManagement.constants";
import type {
  TagActionFlow,
  TagManagementPopupProps,
} from "./TagManagement.types";

const { updateTagName, removeTagRequest } = vi.hoisted(() => ({
  updateTagName: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../api/rooms", () => ({
  updateTagName,
  removeTagRequest,
  getTags: vi.fn(() => Promise.resolve([])),
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@docspace/ui-kit/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("@docspace/ui-kit/hooks/useCloseOnAnchorCovered", () => ({
  useCloseOnAnchorCovered: vi.fn(),
}));

vi.mock("../../hooks/useIsTable", () => ({
  useIsTable: vi.fn(() => false),
}));

vi.mock("@docspace/ui-kit/components/tags", () => ({
  Tags: ({ onOptionTagClick }: { onOptionTagClick: VoidFunction }) => (
    <button type="button" data-testid="open_tags" onClick={onOptionTagClick}>
      tags
    </button>
  ),
}));

// The popup only forwards the callbacks under test, so it is replaced by a
// harness that hands them back to the test.
let popupProps: TagManagementPopupProps | null = null;

vi.mock("./TagManagement.popup", () => ({
  TagManagementPopup: (props: TagManagementPopupProps) => {
    popupProps = props;
    return <div data-testid="popup" />;
  },
}));

const ROOM_ID = "room-1";

const renderTagManagement = (onTagsChanged: VoidFunction) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TagManagement
        id={ROOM_ID}
        tags={["oldTag"]}
        columnCount={2}
        roomName="Room"
        onSelectTag={vi.fn()}
        onTagsChanged={onTagsChanged}
        access={{
          canBindTag: true,
          canCreate: true,
          canSearch: true,
          canEdit: true,
          canRemove: true,
        }}
      />
    </QueryClientProvider>,
  );
};

// Drives both steps: the confirmation answer, then the request itself.
const runFlow = async (flow: TagActionFlow) => {
  await flow.next();
  await flow.next();
};

const openPopup = async (onTagsChanged: VoidFunction) => {
  renderTagManagement(onTagsChanged);

  await userEvent.click(screen.getByTestId("open_tags"));
  await screen.findByTestId("popup");

  if (!popupProps) throw new Error("popup did not receive its props");

  return popupProps;
};

describe("<TagManagement /> tag actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    popupProps = null;
    // Skip the confirmation modals: they are not what these tests are about.
    localStorage.setItem(EDIT_TAG_DONT_SHOW_AGAIN_KEY, "true");
    localStorage.setItem(DELETE_TAG_DONT_SHOW_AGAIN_KEY, "true");
  });

  it("answers the confirmation before sending the rename request", async () => {
    const onTagsChanged = vi.fn();
    const { onEditTag } = await openPopup(onTagsChanged);

    const flow = onEditTag!("oldTag", "newTag");

    const { value: confirmed } = await flow.next();

    expect(confirmed).toBe(true);
    expect(updateTagName).not.toHaveBeenCalled();

    await flow.next();

    expect(updateTagName).toHaveBeenCalledWith("oldTag", "newTag");
  });

  it("reloads the room tags after a rename so the old label does not come back", async () => {
    const onTagsChanged = vi.fn();
    const { onEditTag } = await openPopup(onTagsChanged);

    await runFlow(onEditTag!("oldTag", "newTag"));

    expect(updateTagName).toHaveBeenCalledWith("oldTag", "newTag");
    await waitFor(() => expect(onTagsChanged).toHaveBeenCalledTimes(1));
  });

  it("reloads the room tags after a delete", async () => {
    const onTagsChanged = vi.fn();
    const { onDeleteTag } = await openPopup(onTagsChanged);

    await runFlow(onDeleteTag!("oldTag"));

    expect(removeTagRequest).toHaveBeenCalledWith(["oldTag"]);
    await waitFor(() => expect(onTagsChanged).toHaveBeenCalledTimes(1));
  });

  it("reports a declined confirmation as a value and sends nothing", async () => {
    localStorage.setItem(DELETE_TAG_DONT_SHOW_AGAIN_KEY, "false");

    const onTagsChanged = vi.fn();
    const { onDeleteTag } = await openPopup(onTagsChanged);

    const flow = onDeleteTag!("oldTag");
    const answer = flow.next();

    await userEvent.click(await screen.findByTestId("delete_tag_cancel_button"));

    const { value: confirmed } = await answer;

    expect(confirmed).toBe(false);
    await expect(flow.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
    expect(removeTagRequest).not.toHaveBeenCalled();
    expect(onTagsChanged).not.toHaveBeenCalled();
  });

  it("does not reload the room tags when the rename request fails", async () => {
    updateTagName.mockRejectedValueOnce(new Error("nope"));

    const onTagsChanged = vi.fn();
    const { onEditTag } = await openPopup(onTagsChanged);

    await expect(runFlow(onEditTag!("oldTag", "newTag"))).rejects.toThrow(
      "nope",
    );

    expect(onTagsChanged).not.toHaveBeenCalled();
  });

  it("does not reload the room tags when the delete request fails", async () => {
    removeTagRequest.mockRejectedValueOnce(new Error("nope"));

    const onTagsChanged = vi.fn();
    const { onDeleteTag } = await openPopup(onTagsChanged);

    await expect(runFlow(onDeleteTag!("oldTag"))).rejects.toThrow("nope");

    expect(onTagsChanged).not.toHaveBeenCalled();
  });
});
