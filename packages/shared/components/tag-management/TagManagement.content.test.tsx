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
import { TagManagementContent } from "./TagManagement.content";
import type {
  AccessTagManagement,
  TagsChangedHandler,
} from "./TagManagement.types";
import { TagChangeType } from "./TagManagement.types";

const {
  addTagsToRoom,
  removeTagsFromRoom,
  removeTagRequest,
  updateTagName,
  toastError,
  toastSuccess,
} = vi.hoisted(() => ({
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
  updateTagName: vi.fn(() => Promise.resolve()),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { error: toastError, success: toastSuccess },
}));

vi.mock("../../api/rooms", () => ({
  addTagsToRoom,
  removeTagsFromRoom,
  removeTagRequest,
  updateTagName,
  getTags: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@docspace/ui-kit/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(() => false),
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

// Both confirmations say yes by default: the tests that care about a refusal
// hand in one that answers false.
const newQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const renderContent = (
  access: AccessTagManagement = fullAccess,
  confirmEditTag: () => Promise<boolean> = () => Promise.resolve(true),
  confirmDeleteTag: (label: string) => Promise<boolean> = () =>
    Promise.resolve(true),
  onTagsChanged?: TagsChangedHandler,
  // Handed in by the test that closes the list and opens it again: what is in
  // flight lives in this client, not in the components it renders.
  queryClient: QueryClient = newQueryClient(),
) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <TagManagementProvider
        roomTags={["boundTag"]}
        fetchedTags={["boundTag", "freeTag"]}
        roomId={ROOM_ID}
        access={access}
      >
        <TagManagementContent
          confirmEditTag={confirmEditTag}
          confirmDeleteTag={confirmDeleteTag}
          onTagsChanged={onTagsChanged}
        />
      </TagManagementProvider>
    </QueryClientProvider>,
  );
};

// The testid sits on the ui-kit wrapper, so the state is read off the input
// it renders.
const isChecked = (label: string) =>
  screen
    .getByTestId(`tag_checkbox_${label}`)
    .querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked;

// Holds the next request of a kind open until the test lets it answer.
const holdNext = (request: {
  mockImplementation: (fn: () => Promise<void>) => unknown;
}) => {
  let refuse: (() => void) | null = null;
  let answer: (() => void) | null = null;

  request.mockImplementation(
    () =>
      new Promise<void>((resolve, reject) => {
        answer = () => resolve();
        refuse = () => reject(new Error("nope"));
      }),
  );

  return { settle: () => answer?.(), fail: () => refuse?.() };
};

const rowLabels = () =>
  screen
    .getAllByTestId(/^tag_row_/)
    .map((row) => row.getAttribute("data-testid")?.replace("tag_row_", ""));

// Opens the inline editor on a row and submits a new name.
const renameTo = async (label: string, newLabel: string) => {
  await userEvent.click(screen.getByTestId(`edit_tag_button_${label}`));

  const input = await screen.findByTestId("edit_tag_input");

  await userEvent.clear(input);
  await userEvent.type(input, newLabel);
  await userEvent.click(screen.getByTestId("confirm_edit_button"));
};

describe("<TagManagementContent />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("binds the tag to the room when the row is clicked", async () => {
    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
    });
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
  });

  it("unbinds the tag from the room when a bound row is clicked", async () => {
    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_boundTag"));

    await waitFor(() => {
      expect(removeTagsFromRoom).toHaveBeenCalledWith(ROOM_ID, ["boundTag"]);
    });
    expect(addTagsToRoom).not.toHaveBeenCalled();
  });

  it("toggles the tag when its label is clicked instead of filtering the list", async () => {
    renderContent();

    await userEvent.click(screen.getByTestId("tag_item_freeTag"));

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
    });
    expect(addTagsToRoom).toHaveBeenCalledTimes(1);
  });

  it("toggles the tag exactly once when the checkbox is clicked", async () => {
    renderContent();

    await userEvent.click(screen.getByTestId("tag_checkbox_freeTag"));

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledTimes(1);
    });
    expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
  });

  it("does not toggle the tag when the edit button is clicked", async () => {
    renderContent();

    await userEvent.click(screen.getByTestId("edit_tag_button_freeTag"));

    expect(await screen.findByTestId("edit_tag_input")).toBeInTheDocument();
    expect(addTagsToRoom).not.toHaveBeenCalled();
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
  });

  it("does not toggle the tag when binding is not allowed", async () => {
    renderContent({ ...fullAccess, canBindTag: false });

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    expect(addTagsToRoom).not.toHaveBeenCalled();
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
  });

  it("shows a loader on the row while its request is in flight", async () => {
    let answer: () => void = () => {};

    addTagsToRoom.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          answer = resolve;
        }),
    );

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    // In place of the checkbox, and only on the row that was clicked.
    expect(await screen.findByTestId("tag_loader_freeTag")).toBeInTheDocument();
    expect(
      screen.queryByTestId("tag_checkbox_freeTag"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("tag_checkbox_boundTag")).toBeInTheDocument();

    answer();

    await waitFor(() => {
      expect(
        screen.queryByTestId("tag_loader_freeTag"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
  });

  // The request outlives the list it was started from: the query client sits
  // above the popup, so closing the popup cancels nothing - and does not lose
  // the fact that the row is still waiting.
  it("keeps the loader when the list is closed and opened again", async () => {
    const request = holdNext(addTagsToRoom);
    const queryClient = newQueryClient();

    const list = renderContent(
      fullAccess,
      undefined,
      undefined,
      undefined,
      queryClient,
    );

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    list.unmount();

    renderContent(fullAccess, undefined, undefined, undefined, queryClient);

    // Opened again while the request is still out: the row is still marked,
    // and its checkbox has not come back.
    expect(await screen.findByTestId("tag_loader_freeTag")).toBeInTheDocument();
    expect(
      screen.queryByTestId("tag_checkbox_freeTag"),
    ).not.toBeInTheDocument();

    request.settle();

    await waitFor(() => {
      expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
    });
  });

  it("gives every row a loader of its own", async () => {
    const bind = holdNext(addTagsToRoom);
    const unbind = holdNext(removeTagsFromRoom);

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    // A second row started while the first is still out: both wait, each
    // under its own loader.
    await userEvent.click(screen.getByTestId("tag_row_boundTag"));

    expect(
      await screen.findByTestId("tag_loader_boundTag"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("tag_loader_freeTag")).toBeInTheDocument();
    expect(addTagsToRoom).toHaveBeenCalledTimes(1);
    expect(removeTagsFromRoom).toHaveBeenCalledTimes(1);

    // Each answer clears its own row and leaves the other waiting.
    bind.settle();

    await waitFor(() => {
      expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
    });
    expect(screen.getByTestId("tag_loader_boundTag")).toBeInTheDocument();

    unbind.settle();

    await waitFor(() => {
      expect(screen.getByTestId("tag_checkbox_boundTag")).toBeInTheDocument();
    });
  });

  it("refuses a second request on the row that is already waiting", async () => {
    const request = holdNext(addTagsToRoom);

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    // The row itself, and both of its buttons: nothing new until it answers.
    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await userEvent.click(screen.getByTestId("edit_tag_button_freeTag"));
    await userEvent.click(screen.getByTestId("delete_tag_button_freeTag"));

    expect(addTagsToRoom).toHaveBeenCalledTimes(1);
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
    expect(removeTagRequest).not.toHaveBeenCalled();
    expect(screen.queryByTestId("edit_tag_input")).not.toBeInTheDocument();

    request.settle();

    // And it takes clicks again once its answer is in.
    await waitFor(() => {
      expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    await waitFor(() => {
      expect(removeTagsFromRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
    });
  });

  // What the host is told, rather than that it was told: a room-scoped change
  // names its room, a change to the tag itself does not - and the difference
  // is what lets the host update one room or all of them.
  describe("telling the host what changed", () => {
    // `clearMocks` clears the calls but not the implementations, and the tests
    // above leave requests hanging on purpose - so these say plainly that
    // every request answers.
    beforeEach(() => {
      addTagsToRoom.mockImplementation(() => Promise.resolve());
      removeTagsFromRoom.mockImplementation(() => Promise.resolve());
      removeTagRequest.mockImplementation(() => Promise.resolve());
      updateTagName.mockImplementation(() => Promise.resolve());
    });

    it("names the room a tag was bound to, and unbound from", async () => {
      const onTagsChanged = vi.fn();

      renderContent(fullAccess, undefined, undefined, onTagsChanged);

      await userEvent.click(screen.getByTestId("tag_row_freeTag"));

      await waitFor(() => {
        expect(onTagsChanged).toHaveBeenCalledWith({
          type: TagChangeType.Bound,
          roomId: ROOM_ID,
          label: "freeTag",
        });
      });

      await userEvent.click(screen.getByTestId("tag_row_boundTag"));

      await waitFor(() => {
        expect(onTagsChanged).toHaveBeenCalledWith({
          type: TagChangeType.Unbound,
          roomId: ROOM_ID,
          label: "boundTag",
        });
      });
    });

    it("names no room for a rename", async () => {
      const onTagsChanged = vi.fn();

      renderContent(fullAccess, undefined, undefined, onTagsChanged);

      await renameTo("freeTag", "renamedTag");

      await waitFor(() => {
        expect(onTagsChanged).toHaveBeenCalledWith({
          type: TagChangeType.Renamed,
          oldLabel: "freeTag",
          newLabel: "renamedTag",
        });
      });
    });

    it("names no room for a removal", async () => {
      const onTagsChanged = vi.fn();

      renderContent(fullAccess, undefined, undefined, onTagsChanged);

      await userEvent.click(screen.getByTestId("delete_tag_button_freeTag"));

      await waitFor(() => {
        expect(onTagsChanged).toHaveBeenCalledWith({
          type: TagChangeType.Removed,
          label: "freeTag",
        });
      });
    });

    // Told before the request is sent, so the rooms the host holds tick over
    // at the same moment the row does - and told the other way round when the
    // request fails, which is what puts them back.
    it("tells the host before the answer, and tells it back when it fails", async () => {
      const onTagsChanged = vi.fn();
      const request = holdNext(addTagsToRoom);

      renderContent(fullAccess, undefined, undefined, onTagsChanged);

      await userEvent.click(screen.getByTestId("tag_row_freeTag"));
      await screen.findByTestId("tag_loader_freeTag");

      expect(onTagsChanged).toHaveBeenCalledWith({
        type: TagChangeType.Bound,
        roomId: ROOM_ID,
        label: "freeTag",
      });

      request.fail();

      await waitFor(() => {
        expect(onTagsChanged).toHaveBeenCalledWith({
          type: TagChangeType.Unbound,
          roomId: ROOM_ID,
          label: "freeTag",
        });
      });
      expect(toastError).toHaveBeenCalled();
    });
  });

  describe("before the server answers", () => {
    // The tick itself cannot be seen while the request is out - the loader
    // stands in for the checkbox - so this covers the rollback rather than
    // the optimism. What the early write buys is the list's own state, which
    // is what the search box reads to decide what Enter means.
    it("puts the tick back when the bind fails", async () => {
      const request = holdNext(addTagsToRoom);

      renderContent();

      await userEvent.click(screen.getByTestId("tag_row_freeTag"));
      await screen.findByTestId("tag_loader_freeTag");

      request.fail();

      await waitFor(() => {
        expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
      });
      expect(isChecked("freeTag")).toBe(false);
      expect(toastError).toHaveBeenCalled();
      // Undone by name: the row it never touched keeps its tick.
      expect(isChecked("boundTag")).toBe(true);
    });

    it("renames the row at once, and back again if the rename fails", async () => {
      const request = holdNext(updateTagName);

      renderContent();

      await renameTo("freeTag", "renamedTag");

      // On screen under its new name before the server has agreed - and
      // carrying the loader, so it cannot be acted on meanwhile.
      expect(
        await screen.findByTestId("tag_item_renamedTag"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("tag_loader_renamedTag")).toBeInTheDocument();
      expect(screen.queryByTestId("tag_item_freeTag")).not.toBeInTheDocument();

      request.fail();

      await waitFor(() => {
        expect(screen.getByTestId("tag_item_freeTag")).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId("tag_item_renamedTag"),
      ).not.toBeInTheDocument();
      expect(toastError).toHaveBeenCalled();
    });
  });

  describe("deleting a tag", () => {
    it("sends the delete once the user has confirmed, and says so", async () => {
      const confirmDeleteTag = vi.fn(() => Promise.resolve(true));

      renderContent(fullAccess, undefined, confirmDeleteTag);

      await userEvent.click(screen.getByTestId("delete_tag_button_freeTag"));

      await waitFor(() => {
        expect(removeTagRequest).toHaveBeenCalledWith(["freeTag"]);
      });
      // Asked about the tag whose button was clicked.
      expect(confirmDeleteTag).toHaveBeenCalledWith("freeTag");
      expect(toastSuccess).toHaveBeenCalled();

      // Gone from the list, without waiting for the room to be reloaded.
      await waitFor(() => {
        expect(
          screen.queryByTestId("tag_item_freeTag"),
        ).not.toBeInTheDocument();
      });
    });

    it("keeps the row with its loader until the tag is really gone", async () => {
      const request = holdNext(removeTagRequest);

      renderContent();

      await userEvent.click(screen.getByTestId("delete_tag_button_boundTag"));

      // Still listed while the request is out, and carrying the loader in
      // place of its checkbox - a row taken off the list at once would leave
      // the delete with nothing to show for itself.
      expect(
        await screen.findByTestId("tag_loader_boundTag"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("tag_item_boundTag")).toBeInTheDocument();

      request.settle();

      await waitFor(() => {
        expect(
          screen.queryByTestId("tag_item_boundTag"),
        ).not.toBeInTheDocument();
      });
    });

    it("leaves the row in its place when the delete fails", async () => {
      const request = holdNext(removeTagRequest);

      renderContent();

      await userEvent.click(screen.getByTestId("delete_tag_button_boundTag"));
      await screen.findByTestId("tag_loader_boundTag");

      request.fail();

      // Never left the list, so it is still first and still ticked - there
      // was nothing to put back.
      await waitFor(() => {
        expect(toastError).toHaveBeenCalled();
      });
      expect(screen.getByTestId("tag_item_boundTag")).toBeInTheDocument();
      expect(rowLabels()).toEqual(["boundTag", "freeTag"]);
      expect(isChecked("boundTag")).toBe(true);
    });

    it("sends nothing when the user refuses", async () => {
      const confirmDeleteTag = vi.fn(() => Promise.resolve(false));

      renderContent(fullAccess, undefined, confirmDeleteTag);

      await userEvent.click(screen.getByTestId("delete_tag_button_freeTag"));

      await waitFor(() => {
        expect(confirmDeleteTag).toHaveBeenCalled();
      });
      expect(removeTagRequest).not.toHaveBeenCalled();
      expect(toastSuccess).not.toHaveBeenCalled();
      // The row is still there, and no error was reported either.
      expect(screen.getByTestId("tag_item_freeTag")).toBeInTheDocument();
      expect(toastError).not.toHaveBeenCalled();
    });
  });

  describe("renaming a tag", () => {
    it("sends the rename once the user has confirmed", async () => {
      const confirmEditTag = vi.fn(() => Promise.resolve(true));

      renderContent(fullAccess, confirmEditTag);

      await renameTo("freeTag", "renamedTag");

      await waitFor(() => {
        expect(updateTagName).toHaveBeenCalledWith("freeTag", "renamedTag");
      });
      expect(confirmEditTag).toHaveBeenCalled();
      expect(toastError).not.toHaveBeenCalled();
    });

    it("sends nothing when the user refuses", async () => {
      const confirmEditTag = vi.fn(() => Promise.resolve(false));

      renderContent(fullAccess, confirmEditTag);

      await renameTo("freeTag", "renamedTag");

      await waitFor(() => {
        expect(confirmEditTag).toHaveBeenCalled();
      });
      expect(updateTagName).not.toHaveBeenCalled();
      expect(toastError).not.toHaveBeenCalled();
    });

    it("lets a tag be respelled in another case", async () => {
      renderContent();

      // The only tag carrying this name is the one being renamed.
      await renameTo("freeTag", "FreeTag");

      await waitFor(() => {
        expect(updateTagName).toHaveBeenCalledWith("freeTag", "FreeTag");
      });
      expect(toastError).not.toHaveBeenCalled();
    });

    describe("onto a name another tag already carries", () => {
      it("reports it and keeps the row in edit mode", async () => {
        const confirmEditTag = vi.fn(() => Promise.resolve(true));

        renderContent(fullAccess, confirmEditTag);

        await renameTo("freeTag", "boundTag");

        expect(toastError).toHaveBeenCalledWith("Common:TagAlreadyExists");
        // Not even asked: there is nothing to confirm.
        expect(confirmEditTag).not.toHaveBeenCalled();
        expect(updateTagName).not.toHaveBeenCalled();
        // Still editable, so the name can be corrected instead of retyped.
        expect(
          screen.getByTestId<HTMLInputElement>("edit_tag_input").value,
        ).toBe("boundTag");
      });

      it("reports it whatever the case, since the two read as the same name", async () => {
        const confirmEditTag = vi.fn(() => Promise.resolve(true));

        renderContent(fullAccess, confirmEditTag);

        await renameTo("freeTag", "BOUNDTAG");

        expect(toastError).toHaveBeenCalledWith("Common:TagAlreadyExists");
        expect(confirmEditTag).not.toHaveBeenCalled();
        expect(updateTagName).not.toHaveBeenCalled();
      });
    });
  });
});
