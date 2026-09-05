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
import { TagManagementContent } from "./TagManagement.content";
import type { AccessTagManagement } from "./TagManagement.types";

const { addTagsToRoom, removeTagsFromRoom, toastError } = vi.hoisted(() => ({
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  toastError: vi.fn(),
}));

vi.mock("../../api/rooms", () => ({
  addTagsToRoom,
  removeTagsFromRoom,
  getTags: vi.fn(() => Promise.resolve([])),
  updateTagName: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { error: toastError, success: vi.fn() },
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

const renderFilter = (access: AccessTagManagement = fullAccess) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TagManagementProvider
        roomTags={["boundTag"]}
        fetchedTags={["boundTag", "freeTag"]}
        roomId={ROOM_ID}
        access={access}
      >
        <TagManagementFilter roomName="Room" />
      </TagManagementProvider>
    </QueryClientProvider>,
  );
};

// Both halves of the popup under one provider - the only way to see that a
// request started from the search box reaches the rows.
const renderPopupBody = (access: AccessTagManagement = fullAccess) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TagManagementProvider
        roomTags={["boundTag"]}
        fetchedTags={["boundTag", "freeTag"]}
        roomId={ROOM_ID}
        access={access}
      >
        <TagManagementFilter roomName="Room" />
        <TagManagementContent
          confirmEditTag={() => Promise.resolve(true)}
          confirmDeleteTag={() => Promise.resolve(true)}
        />
      </TagManagementProvider>
    </QueryClientProvider>,
  );
};

// Holds the next request open until the test lets it answer.
const holdNextRequest = () => {
  let answer: (() => void) | null = null;
  let refuse: ((reason: Error) => void) | null = null;

  addTagsToRoom.mockImplementation(
    () =>
      new Promise<void>((resolve, reject) => {
        answer = () => resolve();
        refuse = () => reject(new Error("nope"));
      }),
  );

  return {
    settle: () => answer?.(),
    fail: () => refuse?.(new Error("nope")),
  };
};

const searchInput = () => screen.getByTestId<HTMLInputElement>("add_tag_input");

// The testid sits on the ui-kit wrapper, so the state is read off the input
// it renders.
const isChecked = (label: string) =>
  screen
    .getByTestId(`tag_checkbox_${label}`)
    .querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked;

const rowLabels = () =>
  screen
    .getAllByTestId(/^tag_row_/)
    .map((row) => row.getAttribute("data-testid")?.replace("tag_row_", ""));

const typeAndSubmit = async (value: string) => {
  const input = searchInput();

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
    expect(searchInput().value).toBe("");
  });

  // A name is typed, so it arrives with whatever spacing the typing left in
  // it, and " a  b " and "a b" are the same name to a reader.
  it("collapses the runs of spaces inside a new name", async () => {
    renderFilter();

    await typeAndSubmit("brand   new    tag");

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["brand new tag"]);
    });
  });

  it("ignores the spaces around an existing name", async () => {
    renderFilter();

    await typeAndSubmit("  freeTag  ");

    await waitFor(() => {
      expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["freeTag"]);
    });
  });

  it("sends nothing when the name is only spaces", async () => {
    renderFilter();

    await typeAndSubmit("   ");

    await waitFor(() => {
      expect(searchInput().value).toBe("   ");
    });
    expect(addTagsToRoom).not.toHaveBeenCalled();
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
      expect(searchInput().value).toBe("");
    });
    expect(addTagsToRoom).not.toHaveBeenCalled();
    expect(removeTagsFromRoom).not.toHaveBeenCalled();
  });

  it("sends nothing when the user may not add tags to the room", async () => {
    renderFilter({ ...fullAccess, canBindTag: false });

    await typeAndSubmit("freeTag");

    await waitFor(() => {
      expect(searchInput().value).toBe("");
    });
    expect(addTagsToRoom).not.toHaveBeenCalled();
  });

  // The input is cleared the moment Enter is pressed, so if the list waited
  // for the server the tag would be nowhere at all until it answered.
  describe("before the server answers", () => {
    it("lists a created tag at once, leading the list", async () => {
      const request = holdNextRequest();

      renderPopupBody();

      await typeAndSubmit("brandNewTag");

      const row = await screen.findByTestId("tag_item_brandNewTag");

      expect(row).toBeInTheDocument();
      expect(rowLabels()[0]).toBe("brandNewTag");
      // Not clickable while it is not on the server: there is nothing yet to
      // bind or unbind.
      expect(screen.getByTestId("tag_loader_brandNewTag")).toBeInTheDocument();

      request.settle();

      await waitFor(() => {
        expect(
          screen.queryByTestId("tag_loader_brandNewTag"),
        ).not.toBeInTheDocument();
      });
      expect(screen.getByTestId("tag_item_brandNewTag")).toBeInTheDocument();
    });

    it("takes a created tag back off the list when the request fails", async () => {
      const request = holdNextRequest();

      renderPopupBody();

      await typeAndSubmit("brandNewTag");
      await screen.findByTestId("tag_item_brandNewTag");

      request.fail();

      await waitFor(() => {
        expect(
          screen.queryByTestId("tag_item_brandNewTag"),
        ).not.toBeInTheDocument();
      });
      expect(toastError).toHaveBeenCalled();
      // Undone by name: the rows it never touched are still there.
      expect(rowLabels()).toEqual(["boundTag", "freeTag"]);
    });

    it("shows the loader on the row an existing tag is added from", async () => {
      const request = holdNextRequest();

      renderPopupBody();

      await typeAndSubmit("freeTag");

      // The proof that the search box and the rows share one set of
      // mutations - with an observer each, this row stayed idle.
      expect(
        await screen.findByTestId("tag_loader_freeTag"),
      ).toBeInTheDocument();

      request.settle();

      await waitFor(() => {
        expect(
          screen.queryByTestId("tag_loader_freeTag"),
        ).not.toBeInTheDocument();
      });
    });

    it("unticks an added tag again when the request fails", async () => {
      const request = holdNextRequest();

      renderPopupBody();

      await typeAndSubmit("freeTag");
      await screen.findByTestId("tag_loader_freeTag");

      request.fail();

      await waitFor(() => {
        expect(isChecked("freeTag")).toBe(false);
      });
      expect(toastError).toHaveBeenCalled();
      // Undone by name: the row it never touched keeps its tick.
      expect(isChecked("boundTag")).toBe(true);
    });

    it("starts nothing else while the request is out", async () => {
      const request = holdNextRequest();

      renderPopupBody();

      await typeAndSubmit("brandNewTag");
      await screen.findByTestId("tag_item_brandNewTag");

      await typeAndSubmit("secondTag");

      expect(addTagsToRoom).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByTestId("tag_item_secondTag"),
      ).not.toBeInTheDocument();

      request.settle();
    });
  });
});

