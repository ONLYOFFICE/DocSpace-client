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
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { TagType } from "@docspace/ui-kit/components/tag";
import {
  TagManagementProvider,
  useTagManagement,
} from "./TagManagement.provider";
import { getTags } from "../../api/rooms";
import { TAGS_QUERY_KEY } from "./TagManagement.constants";
import type { AccessTagManagement } from "./TagManagement.types";
import {
  useCreateTagMutation,
  useRemoveTagMutation,
  useUpdateTag,
  useUpdateTagNameMutation,
} from "./hooks/useTagsQuery";

vi.mock("../../api/rooms", () => ({
  getTags: vi.fn(() => Promise.resolve([])),
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  updateTagName: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
}));

// The tags query is the source of truth for which tags exist, so a test seeds
// the cache rather than handing the provider a list.
const renderProvider = ({
  roomTags = [],
  fetchedTags = [],
  access = {},
}: {
  roomTags?: Array<TagType | string>;
  fetchedTags?: string[];
  access?: AccessTagManagement;
} = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  queryClient.setQueryData(TAGS_QUERY_KEY, fetchedTags);

  return render(
    <QueryClientProvider client={queryClient}>
      <TagManagementProvider roomId="room-1" roomTags={roomTags} access={access}>
        <TestComponent />
      </TagManagementProvider>
    </QueryClientProvider>,
  );
};

const TestComponent = () => {
  const {
    tags,
    searchValue,
    deferredSearchValue,
    filteredTags,
    showCreateTag,
    setSearchValue,
    clearSearch,
  } = useTagManagement();

  return (
    <div>
      <div data-testid="tags-count">{tags.length}</div>
      <div data-testid="filtered-count">{filteredTags.length}</div>
      <div data-testid="search-value">{searchValue}</div>
      <div data-testid="deferred-search">{deferredSearchValue}</div>
      <div data-testid="show-create">{showCreateTag.toString()}</div>
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button data-testid="clear-button" onClick={clearSearch}>
        Clear
      </button>
      <ul data-testid="filtered-list">
        {filteredTags.map((tag) => (
          <li key={tag.label}>{tag.label}</li>
        ))}
      </ul>
      <ul data-testid="checked-list">
        {tags
          .filter((tag) => tag.checked)
          .map((tag) => (
            <li key={tag.label}>{tag.label}</li>
          ))}
      </ul>
    </div>
  );
};

describe("TagManagementProvider", () => {
  it("throws error when useTagManagement is used outside provider", () => {
    expect(() => render(<TestComponent />)).toThrow(
      "useTagManagement must be used within TagManagementProvider",
    );
  });

  it("initializes with room tags and fetched tags", () => {
    const roomTags = ["tag1", "tag2"];
    const fetchedTags = ["tag3", "tag4"];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    expect(screen.getByTestId("tags-count")).toHaveTextContent("4");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("4");
  });

  it("filters out default tags from room tags", () => {
    const roomTags: TagType[] = [
      { label: "normalTag", isDefault: false, isThirdParty: false },
      { label: "defaultTag", isDefault: true, isThirdParty: false },
    ];
    const fetchedTags = ["tag3"];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    expect(screen.getByTestId("tags-count")).toHaveTextContent("2");
    const list = screen.getByTestId("filtered-list");
    expect(list).not.toHaveTextContent("defaultTag");
  });

  it("updates search value correctly", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    expect(screen.getByTestId("search-value")).toHaveTextContent("test");
  });

  it("filters tags based on search value", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing", "production"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByTestId("deferred-search")).toHaveTextContent("test");
    });

    await waitFor(() => {
      const filteredCount = screen.getByTestId("filtered-count");
      expect(parseInt(filteredCount.textContent || "0")).toBeLessThan(3);
    });
  });

  it("clears search value when clearSearch is called", async () => {
    const user = userEvent.setup();
    const roomTags = ["test"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");
    expect(screen.getByTestId("search-value")).toHaveTextContent("test");

    const clearButton = screen.getByTestId("clear-button");
    await user.click(clearButton);

    expect(screen.getByTestId("search-value")).toHaveTextContent("");
  });

  it("shows create tag option when no exact match exists", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: { canCreate: true } });

    const input = screen.getByTestId("search-input");
    await user.type(input, "newTag");

    await waitFor(() => {
      expect(screen.getByTestId("show-create")).toHaveTextContent("true");
    });
  });

  it("does not offer to create a tag that exists in another case", async () => {
    const user = userEvent.setup();

    renderProvider({
      roomTags: ["BoundTag"],
      fetchedTags: [],
      access: { canCreate: true },
    });

    // The rename check treats the two as the same name, so creating one next
    // to the other has to be refused as well.
    await user.type(screen.getByTestId("search-input"), "boundtag");

    await waitFor(() => {
      expect(screen.getByTestId("show-create")).toHaveTextContent("false");
    });
  });

  it("does not show create tag option when exact match exists", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: { canCreate: true } });

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByTestId("show-create")).toHaveTextContent("false");
    });
  });

  it("returns all tags when search is empty", () => {
    const roomTags = ["tag1", "tag2", "tag3"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    expect(screen.getByTestId("filtered-count")).toHaveTextContent("3");
    expect(screen.getByTestId("show-create")).toHaveTextContent("false");
  });

  it("handles empty room tags and fetched tags", () => {
    renderProvider({ roomTags: [], fetchedTags: [], access: {} });

    expect(screen.getByTestId("tags-count")).toHaveTextContent("0");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("0");
  });

  it("prioritizes exact matches in search results", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "test 2", "testing"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    await waitFor(() => {
      const list = screen.getByTestId("filtered-list");
      const items = list.querySelectorAll("li");
      expect(items[0]).toHaveTextContent("test");
    });
  });

  it("uses deferred value for search", async () => {
    const user = userEvent.setup();
    const roomTags = ["test"];
    const fetchedTags: string[] = [];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    const input = screen.getByTestId("search-input");
    await user.type(input, "t");

    expect(screen.getByTestId("search-value")).toHaveTextContent("t");

    await waitFor(() => {
      expect(screen.getByTestId("deferred-search")).toHaveTextContent("t");
    });
  });

  it("merges room tags and fetched tags without duplicates", () => {
    const roomTags = ["tag1", "tag2"];
    const fetchedTags = ["tag2", "tag3"];

    renderProvider({ roomTags: roomTags, fetchedTags: fetchedTags, access: {} });

    expect(screen.getByTestId("tags-count")).toHaveTextContent("3");
    const list = screen.getByTestId("filtered-list");
    expect(list.textContent).toContain("tag1");
    expect(list.textContent).toContain("tag2");
    expect(list.textContent).toContain("tag3");
  });

  // A rename or a delete from another session arrives here as the room's tags
  // changing under a query that still lists the tag under its old name - the
  // mutation cache of this tab knows nothing about it. See useRoomTagList.
  it("refetches the shared list when the room's tags change under it", async () => {
    vi.mocked(getTags).mockResolvedValue(["old"]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData(TAGS_QUERY_KEY, ["old"]);

    const tree = (roomTags: string[]) => (
      <QueryClientProvider client={queryClient}>
        <TagManagementProvider roomId="room-1" roomTags={roomTags} access={{}}>
          <TestComponent />
        </TagManagementProvider>
      </QueryClientProvider>
    );

    const { rerender } = render(tree(["old"]));

    await waitFor(() => {
      expect(screen.getByTestId("tags-count")).toHaveTextContent("1");
    });

    vi.mocked(getTags).mockResolvedValue(["new"]);
    rerender(tree(["new"]));

    // Without the refetch the query's copy of the old name would be listed
    // next to the room's new one, as a second tag, and would stay there.
    await waitFor(() => {
      expect(screen.getByTestId("tags-count")).toHaveTextContent("1");
    });
    expect(screen.getByTestId("filtered-list")).not.toHaveTextContent("old");
  });

  // The create record keeps the name the tag was created under, and the room
  // has not reported the tag at all yet - so the rename has to be followed
  // from the record too, not only from the room's own copy of the tag.
  it("lists a tag created and then renamed under its new name only", async () => {
    const user = userEvent.setup();

    // Nothing to fetch: both names reach the query only through the mutations'
    // own writes, which is exactly the window the bug lived in.
    vi.mocked(getTags).mockResolvedValue([]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData(TAGS_QUERY_KEY, []);

    // Outside the provider on purpose: the mutations write to the query client,
    // which is what the list reads - nothing is handed to it directly.
    const Actions = () => {
      const createTag = useCreateTagMutation("room-1");
      const renameTag = useUpdateTagNameMutation();

      return (
        <div>
          <button
            data-testid="create-tag"
            onClick={() => createTag.mutate("created")}
          >
            create
          </button>
          <button
            data-testid="rename-tag"
            onClick={() =>
              renameTag.mutate({ oldLabel: "created", newLabel: "renamed" })
            }
          >
            rename
          </button>
        </div>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Actions />
        {/* The room does not report the tag: the host has not reloaded it. */}
        <TagManagementProvider roomId="room-1" roomTags={[]} access={{}}>
          <TestComponent />
        </TagManagementProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByTestId("create-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("filtered-list")).toHaveTextContent("created");
    });

    await user.click(screen.getByTestId("rename-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("filtered-list")).toHaveTextContent("renamed");
    });

    // Both names at once is the bug: the create record carries the old one and
    // the query already reports the new one.
    expect(screen.getByTestId("tags-count")).toHaveTextContent("1");
    expect(screen.getByTestId("filtered-list")).not.toHaveTextContent("created");
  });

  // The bind record is written under the name the tag had when the box was
  // clicked, and the sweep matches records against what the room claims -
  // which the list reports under the name the tag has now.
  it("keeps a created tag unticked after it is renamed", async () => {
    const user = userEvent.setup();

    vi.mocked(getTags).mockResolvedValue([]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData(TAGS_QUERY_KEY, []);

    const Actions = () => {
      const createTag = useCreateTagMutation("room-1");
      const bindTag = useUpdateTag("room-1");
      const renameTag = useUpdateTagNameMutation();

      return (
        <div>
          <button
            data-testid="create-tag"
            onClick={() => createTag.mutate("created")}
          >
            create
          </button>
          <button
            data-testid="unbind-tag"
            onClick={() => bindTag.mutate({ label: "created", checked: false })}
          >
            unbind
          </button>
          <button
            data-testid="rename-tag"
            onClick={() =>
              renameTag.mutate({ oldLabel: "created", newLabel: "renamed" })
            }
          >
            rename
          </button>
        </div>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Actions />
        <TagManagementProvider roomId="room-1" roomTags={[]} access={{}}>
          <TestComponent />
        </TagManagementProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByTestId("create-tag"));

    // Creating binds it: the same request attaches the tag to the room.
    await waitFor(() => {
      expect(screen.getByTestId("checked-list")).toHaveTextContent("created");
    });

    await user.click(screen.getByTestId("unbind-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("checked-list")).not.toHaveTextContent(
        "created",
      );
    });

    await user.click(screen.getByTestId("rename-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("filtered-list")).toHaveTextContent("renamed");
    });

    // The rename must not resurrect the bind: nothing has confirmed the tag is
    // attached to the room, so the box has to stay where the user put it.
    expect(screen.getByTestId("checked-list")).not.toHaveTextContent("renamed");
  });

  // Renaming and then deleting frees the name, and creating it again makes a
  // different tag that happens to carry it. The bind record of the first one
  // still addresses the name, and the query cannot tell it is stale - the name
  // exists again.
  it("binds a tag recreated under a name an unbound tag used to carry", async () => {
    const user = userEvent.setup();

    vi.mocked(getTags).mockResolvedValue([]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData(TAGS_QUERY_KEY, []);

    const Actions = () => {
      const createTag = useCreateTagMutation("room-1");
      const bindTag = useUpdateTag("room-1");
      const renameTag = useUpdateTagNameMutation();
      const removeTag = useRemoveTagMutation();

      return (
        <div>
          <button
            data-testid="create-tag"
            onClick={() => createTag.mutate("reused")}
          >
            create
          </button>
          <button
            data-testid="unbind-tag"
            onClick={() => bindTag.mutate({ label: "reused", checked: false })}
          >
            unbind
          </button>
          <button
            data-testid="rename-tag"
            onClick={() =>
              renameTag.mutate({ oldLabel: "reused", newLabel: "renamed" })
            }
          >
            rename
          </button>
          <button
            data-testid="remove-tag"
            onClick={() => removeTag.mutate("renamed")}
          >
            remove
          </button>
        </div>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Actions />
        <TagManagementProvider roomId="room-1" roomTags={[]} access={{}}>
          <TestComponent />
        </TagManagementProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByTestId("create-tag"));
    await user.click(screen.getByTestId("unbind-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("checked-list")).not.toHaveTextContent("reused");
    });

    await user.click(screen.getByTestId("rename-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("filtered-list")).toHaveTextContent("renamed");
    });

    await user.click(screen.getByTestId("remove-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("tags-count")).toHaveTextContent("0");
    });

    // The name is free again, and this is a new tag under it - created here,
    // so bound here, whatever the record of the tag that carried it says.
    await user.click(screen.getByTestId("create-tag"));

    await waitFor(() => {
      expect(screen.getByTestId("checked-list")).toHaveTextContent("reused");
    });
  });
});
