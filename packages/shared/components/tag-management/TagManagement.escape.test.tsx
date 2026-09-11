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
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TagManagementPopup } from "./TagManagement.popup";
import { TAGS_QUERY_KEY } from "./TagManagement.constants";
import type { AccessTagManagement } from "./TagManagement.types";

const { getTags } = vi.hoisted(() => ({
  getTags: vi.fn(() => Promise.resolve<string[]>([])),
}));

vi.mock("../../api/rooms", () => ({
  getTags,
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
  updateTagName: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../utils/useClickOutside", () => ({
  useClickOutside: vi.fn(),
}));

vi.mock("@docspace/ui-kit/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@docspace/ui-kit/components/scrollbar", () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const ROOM_ID = "room-1";

const fullAccess: AccessTagManagement = {
  canBindTag: true,
  canCreate: true,
  canSearch: true,
  canEdit: true,
  canRemove: true,
};

// The real popup, so that what is under test is the whole ladder as it is
// wired: the step the list owns and the fallback the popup keeps for the
// states in which there is no list yet.
const renderPopup = ({
  onClose,
  confirmEditTag = () => Promise.resolve(true),
}: {
  onClose: VoidFunction;
  confirmEditTag?: () => Promise<boolean>;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <TagManagementPopup
        tags={["boundTag"]}
        roomId={ROOM_ID}
        onClose={onClose}
        anchor={{ current: document.createElement("div") }}
        access={fullAccess}
        roomName="Room"
        confirmEditTag={confirmEditTag}
        confirmDeleteTag={() => Promise.resolve(true)}
      />
    </QueryClientProvider>,
  );

  // Handed back so the tests of the states with no list can wait for the
  // query itself to settle - those states render nothing to wait for.
  return { ...view, queryClient };
};

// Holds the rename confirmation open until the test answers it, so that a
// press can land while the modal is still up.
const holdConfirmation = () => {
  let answer: ((confirmed: boolean) => void) | null = null;

  return {
    ask: () =>
      new Promise<boolean>((resolve) => {
        answer = resolve;
      }),
    wasAsked: () => answer !== null,
    refuse: () => answer?.(false),
  };
};

const tagsQueryStatus = (queryClient: QueryClient) =>
  queryClient.getQueryState(TAGS_QUERY_KEY)?.status;

const searchInput = () => screen.getByTestId<HTMLInputElement>("add_tag_input");

const rowLabels = () =>
  screen
    .getAllByTestId(/^tag_row_/)
    .map((row) => row.getAttribute("data-testid")?.replace("tag_row_", ""));

// One press undoes one thing, innermost first, so nothing the user is still
// looking at is thrown away by the same key that closes the popup.
describe("<TagManagementPopup /> Escape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTags.mockResolvedValue(["boundTag", "freeTag"]);
  });

  it("closes the popup when neither the editor nor the filter is open", async () => {
    const onClose = vi.fn();

    renderPopup({ onClose });
    await screen.findByTestId("tag_item_freeTag");

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clears the filter first, and closes on the press after that", async () => {
    const onClose = vi.fn();

    renderPopup({ onClose });
    await screen.findByTestId("tag_item_freeTag");

    await userEvent.type(searchInput(), "free");
    await waitFor(() => {
      expect(rowLabels()).toEqual(["freeTag"]);
    });

    await userEvent.keyboard("{Escape}");

    // The whole list is back and the input with it, and the popup is still up.
    await waitFor(() => {
      expect(searchInput().value).toBe("");
    });
    expect(rowLabels()).toEqual(["boundTag", "freeTag"]);
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // A search of nothing but spaces filters nothing, so the list looks
  // untouched - but the box is not empty, and Escape empties what it can see
  // before it closes anything.
  it("clears a search that filtered nothing before closing", async () => {
    const onClose = vi.fn();

    renderPopup({ onClose });
    await screen.findByTestId("tag_item_freeTag");

    await userEvent.type(searchInput(), "   ");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(searchInput().value).toBe("");
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes the editor first, leaving the filter as it was", async () => {
    const onClose = vi.fn();

    renderPopup({ onClose });
    await screen.findByTestId("tag_item_freeTag");

    await userEvent.type(searchInput(), "free");
    await waitFor(() => {
      expect(rowLabels()).toEqual(["freeTag"]);
    });

    await userEvent.click(screen.getByTestId("edit_tag_button_freeTag"));
    expect(await screen.findByTestId("edit_tag_input")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByTestId("edit_tag_input")).not.toBeInTheDocument();
    });
    // Only the editor went: the search is still on, and nothing closed.
    expect(searchInput().value).toBe("free");
    expect(rowLabels()).toEqual(["freeTag"]);
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(searchInput().value).toBe("");
    });
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // The confirmation on top answers Escape itself; the ladder underneath it
  // must not take the same press as well.
  it("leaves Escape to a confirmation waiting for an answer", async () => {
    const onClose = vi.fn();
    const confirmation = holdConfirmation();

    renderPopup({ onClose, confirmEditTag: confirmation.ask });
    await screen.findByTestId("tag_item_freeTag");

    await userEvent.click(screen.getByTestId("edit_tag_button_freeTag"));
    await screen.findByTestId("edit_tag_input");

    await userEvent.type(screen.getByTestId("edit_tag_input"), "X{Enter}");

    await waitFor(() => {
      expect(confirmation.wasAsked()).toBe(true);
    });

    await userEvent.keyboard("{Escape}");

    // Neither the editor nor the popup moved: that press was the modal's.
    expect(screen.getByTestId("edit_tag_input")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    // Answered before the test ends, so the editor's own reaction to the
    // refusal lands inside the test rather than after it.
    await act(async () => {
      confirmation.refuse();
    });
  });

  // With no list there is no ladder to walk, and the popup still has to close.
  it("closes while the list is still loading", async () => {
    const onClose = vi.fn();

    getTags.mockImplementation(() => new Promise<string[]>(() => {}));

    const { queryClient } = renderPopup({ onClose });

    expect(tagsQueryStatus(queryClient)).toBe("pending");
    expect(screen.queryByTestId("add_tag_input")).not.toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the list never arrived", async () => {
    const onClose = vi.fn();

    getTags.mockRejectedValue(new Error("nope"));

    const { queryClient } = renderPopup({ onClose });

    await waitFor(() => {
      expect(tagsQueryStatus(queryClient)).toBe("error");
    });

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

