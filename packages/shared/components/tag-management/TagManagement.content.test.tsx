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
import type { AccessTagManagement } from "./TagManagement.types";

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
const renderContent = (
  access: AccessTagManagement = fullAccess,
  confirmEditTag: () => Promise<boolean> = () => Promise.resolve(true),
  confirmDeleteTag: (label: string) => Promise<boolean> = () =>
    Promise.resolve(true),
) => {
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
        <TagManagementContent
          roomId={ROOM_ID}
          confirmEditTag={confirmEditTag}
          confirmDeleteTag={confirmDeleteTag}
        />
      </TagManagementProvider>
    </QueryClientProvider>,
  );
};

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

  it("starts nothing else while a request is out", async () => {
    let answer: () => void = () => {};

    addTagsToRoom.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          answer = resolve;
        }),
    );

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    // Another row, and the buttons on the busy one: none of them may send a
    // second request while the first is still out.
    await userEvent.click(screen.getByTestId("tag_row_boundTag"));
    await userEvent.click(screen.getByTestId("edit_tag_button_freeTag"));
    await userEvent.click(screen.getByTestId("delete_tag_button_freeTag"));

    expect(addTagsToRoom).toHaveBeenCalledTimes(1);
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
    expect(removeTagRequest).not.toHaveBeenCalled();
    expect(screen.queryByTestId("edit_tag_input")).not.toBeInTheDocument();

    answer();

    // And it works again once the answer is in.
    await waitFor(() => {
      expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("tag_row_boundTag"));

    await waitFor(() => {
      expect(removeTagsFromRoom).toHaveBeenCalledWith(ROOM_ID, ["boundTag"]);
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
        expect(screen.getByTestId("edit_tag_input")).toHaveValue("boundTag");
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
