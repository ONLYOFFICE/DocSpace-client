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
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TagManagementProvider } from "./TagManagement.provider";
import { TagManagementContent } from "./TagManagement.content";
import {
  useCreateTagMutation,
  useRemoveTagMutation,
  useUpdateTag,
  useUpdateTagNameMutation,
} from "./hooks/useTagsQuery";
import {
  TAG_RENAME_MUTATION_KEY,
  TAGS_QUERY_KEY,
} from "./TagManagement.constants";
import type { AccessTagManagement } from "./TagManagement.types";

const {
  addTagsToRoom,
  removeTagsFromRoom,
  updateTagName,
  removeTagRequest,
  getTags,
} = vi.hoisted(() => ({
  addTagsToRoom: vi.fn(() => Promise.resolve()),
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  updateTagName: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
  // The query is the source of truth for which tags exist, so refetching must
  // return the same list the cache is seeded with.
  getTags: vi.fn(() => Promise.resolve(["boundTag", "freeTag"])),
}));

vi.mock("../../api/rooms", () => ({
  addTagsToRoom,
  removeTagsFromRoom,
  updateTagName,
  removeTagRequest,
  getTags,
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

const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  // The tags query is the source of truth for which tags exist.
  queryClient.setQueryData(TAGS_QUERY_KEY, ["boundTag", "freeTag"]);

  return queryClient;
};

const TagList = ({
  access,
  roomId = ROOM_ID,
  roomTags = ["boundTag"],
}: {
  access: AccessTagManagement;
  roomId?: string;
  roomTags?: string[];
}) => (
  <TagManagementProvider roomTags={roomTags} roomId={roomId} access={access}>
    <TagManagementContent roomId={roomId} />
  </TagManagementProvider>
);

const renderContent = (
  access: AccessTagManagement = fullAccess,
  queryClient: QueryClient = createQueryClient(),
  roomId: string = ROOM_ID,
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <TagList access={access} roomId={roomId} />
    </QueryClientProvider>,
  );

type MutationHandlers = {
  rename: (oldLabel?: string, newLabel?: string) => void;
  remove: (label?: string) => void;
  create: (label: string) => Promise<unknown>;
  bind: (label: string, checked: boolean) => Promise<unknown>;
};

// Stands in for the room row that owns the rename/delete mutations: it starts
// one and stays mounted while the tag list itself is closed and reopened.
const MutationStarter = ({
  onReady,
}: {
  onReady: (handlers: MutationHandlers) => void;
}) => {
  const rename = useUpdateTagNameMutation();
  const remove = useRemoveTagMutation();
  const create = useCreateTagMutation(ROOM_ID);
  const bind = useUpdateTag(ROOM_ID);

  onReady({
    rename: (oldLabel = "freeTag", newLabel = "renamed") =>
      rename.mutate({ oldLabel, newLabel }),
    remove: (label = "boundTag") => remove.mutate(label),
    create: (label: string) => create.mutateAsync(label),
    bind: (label: string, checked: boolean) =>
      bind.mutateAsync({ label, checked }),
  });

  return null;
};

const renderMutationStarter = (queryClient: QueryClient) => {
  const handlers: MutationHandlers = {
    rename: () => {},
    remove: () => {},
    create: () => Promise.resolve(),
    bind: () => Promise.resolve(),
  };

  const view = render(
    <QueryClientProvider client={queryClient}>
      <MutationStarter
        onReady={(next) => {
          handlers.rename = next.rename;
          handlers.remove = next.remove;
          handlers.create = next.create;
          handlers.bind = next.bind;
        }}
      />
    </QueryClientProvider>,
  );

  return { handlers, unmount: view.unmount };
};

// The labels of the rows, top to bottom.
const rowLabels = () =>
  screen
    .getAllByTestId(/^tag_row_/)
    .map((row) => row.getAttribute("data-testid")?.replace("tag_row_", ""));

// The test id sits on the wrapper, the checked state on the input inside it.
const getCheckbox = (label: string) =>
  within(screen.getByTestId(`tag_row_${label}`)).getByRole("checkbox");

describe("<TagManagementContent />", () => {
  beforeEach(() => {
    // reset, not clear: a test that installs a deferred implementation with
    // mockImplementation would otherwise leave it in place and hang every
    // request the tests after it make.
    vi.resetAllMocks();
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

  it("shows a loader only for the tag being bound and drops it afterwards", async () => {
    let resolveRequest: VoidFunction = () => {};
    addTagsToRoom.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    expect(await screen.findByTestId("tag_loader_freeTag")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_checkbox_freeTag")).not.toBeInTheDocument();
    // The other row keeps its checkbox: binding a tag is a per-tag operation.
    expect(screen.getByTestId("tag_checkbox_boundTag")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_loader_boundTag")).not.toBeInTheDocument();

    resolveRequest();

    await waitFor(() => {
      expect(screen.queryByTestId("tag_loader_freeTag")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
  });

  it("does not start a second request while the tag is being bound", async () => {
    addTagsToRoom.mockImplementationOnce(() => new Promise<void>(() => {}));

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    expect(addTagsToRoom).toHaveBeenCalledTimes(1);
  });

  it("keeps the rename loader when the list is closed and opened again", async () => {
    updateTagName.mockImplementationOnce(() => new Promise<void>(() => {}));

    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.rename();

    // A tag list opened after the rename started still has to report the tag
    // as busy, and so does the next one opened after this is closed.
    // The rename is already applied to the tags query, so the row is listed
    // under its new name - once, not twice - and carries the loader.
    const list = renderContent(fullAccess, queryClient);
    expect(await screen.findByTestId("tag_loader_renamed")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_item_freeTag")).not.toBeInTheDocument();
    list.unmount();

    const reopened = renderContent(fullAccess, queryClient);
    expect(await screen.findByTestId("tag_loader_renamed")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_checkbox_renamed")).not.toBeInTheDocument();

    reopened.unmount();
    starter.unmount();
  });

  it("keeps the delete loader when the list is closed and opened again", async () => {
    removeTagRequest.mockImplementationOnce(() => new Promise<void>(() => {}));

    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.remove();

    const list = renderContent(fullAccess, queryClient);
    expect(await screen.findByTestId("tag_loader_boundTag")).toBeInTheDocument();
    list.unmount();

    const reopened = renderContent(fullAccess, queryClient);
    expect(await screen.findByTestId("tag_loader_boundTag")).toBeInTheDocument();

    reopened.unmount();
    starter.unmount();
  });

  it("does not delete, edit or toggle a tag while an operation is running for it", async () => {
    removeTagRequest.mockImplementationOnce(() => new Promise<void>(() => {}));

    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.remove();

    const list = renderContent(fullAccess, queryClient);
    await screen.findByTestId("tag_loader_boundTag");

    await userEvent.click(screen.getByTestId("delete_tag_button_boundTag"));
    await userEvent.click(screen.getByTestId("edit_tag_button_boundTag"));
    await userEvent.click(screen.getByTestId("tag_row_boundTag"));

    expect(removeTagRequest).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("edit_tag_input")).not.toBeInTheDocument();
    expect(removeTagsFromRoom).not.toHaveBeenCalled();

    list.unmount();
    starter.unmount();
  });

  it("keeps the bind loader when the list is closed and opened again", async () => {
    addTagsToRoom.mockImplementationOnce(() => new Promise<void>(() => {}));

    const queryClient = createQueryClient();
    const list = renderContent(fullAccess, queryClient);

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    list.unmount();
    const reopened = renderContent(fullAccess, queryClient);

    expect(await screen.findByTestId("tag_loader_freeTag")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_checkbox_freeTag")).not.toBeInTheDocument();

    reopened.unmount();
  });

  it("does not show the bind loader in another room", async () => {
    addTagsToRoom.mockImplementationOnce(() => new Promise<void>(() => {}));

    const queryClient = createQueryClient();
    const list = renderContent(fullAccess, queryClient);

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await screen.findByTestId("tag_loader_freeTag");

    list.unmount();
    // Same tag, different room: binding it there is a separate operation.
    const other = renderContent(fullAccess, queryClient, "room-2");

    expect(await screen.findByTestId("tag_checkbox_freeTag")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_loader_freeTag")).not.toBeInTheDocument();

    other.unmount();
  });

  it("picks up tags that appear in the query after the list is open", async () => {
    const queryClient = createQueryClient();

    renderContent(fullAccess, queryClient);
    await screen.findByTestId("tag_item_freeTag");

    // Another list, a refetch, an invalidation - the query is the source of
    // truth, and a list already on screen has to follow it.
    queryClient.setQueryData(TAGS_QUERY_KEY, [
      "boundTag",
      "freeTag",
      "addedElsewhere",
    ]);

    expect(
      await screen.findByTestId("tag_item_addedElsewhere"),
    ).toBeInTheDocument();
  });

  it("keeps a bind visible after reopening, before the room data catches up", async () => {
    const queryClient = createQueryClient();
    const list = renderContent(fullAccess, queryClient);

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await waitFor(() => expect(addTagsToRoom).toHaveBeenCalledTimes(1));

    list.unmount();
    // The room still reports its old tags here: the checkbox has to stay on
    // anyway, because the bind that turned it on already succeeded.
    renderContent(fullAccess, queryClient);

    await screen.findByTestId("tag_checkbox_freeTag");

    await waitFor(() => expect(getCheckbox("freeTag")).toBeChecked());
  });

  it("keeps both toggles when two tags are bound at once", async () => {
    const resolvers: VoidFunction[] = [];
    addTagsToRoom.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    removeTagsFromRoom.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve);
        }),
    );

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));
    await userEvent.click(screen.getByTestId("tag_row_boundTag"));

    await waitFor(() => expect(resolvers).toHaveLength(2));
    resolvers.forEach((resolve) => resolve());

    // Neither request overwrote the other one's result with a stale copy of
    // the whole list.
    await waitFor(() => expect(getCheckbox("freeTag")).toBeChecked());
    expect(getCheckbox("boundTag")).not.toBeChecked();
  });

  it("puts the tag back when binding fails", async () => {
    addTagsToRoom.mockRejectedValueOnce(new Error("nope"));

    renderContent();

    await userEvent.click(screen.getByTestId("tag_row_freeTag"));

    await waitFor(() => expect(addTagsToRoom).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getCheckbox("freeTag")).not.toBeChecked());
  });

  it("shows the delete loader in every room, not only where it started", async () => {
    removeTagRequest.mockImplementationOnce(() => new Promise<void>(() => {}));

    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    // freeTag on purpose: the other room does not carry it, so the row can only
    // come from the tags query. An optimistic removal used to drop it there the
    // moment the request was sent, and the loader had nothing to sit on.
    starter.handlers.remove("freeTag");

    const other = renderContent(fullAccess, queryClient, "room-2");

    expect(await screen.findByTestId("tag_item_freeTag")).toBeInTheDocument();
    expect(await screen.findByTestId("tag_loader_freeTag")).toBeInTheDocument();

    other.unmount();
    starter.unmount();
  });

  it("drops the tag everywhere once the delete goes through", async () => {
    let resolveRequest: VoidFunction = () => {};
    removeTagRequest.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.remove("freeTag");

    const other = renderContent(fullAccess, queryClient, "room-2");
    await screen.findByTestId("tag_loader_freeTag");

    resolveRequest();

    await waitFor(() =>
      expect(screen.queryByTestId("tag_item_freeTag")).not.toBeInTheDocument(),
    );

    other.unmount();
    starter.unmount();
  });

  it("follows the room tags when the host replaces them", async () => {
    const queryClient = createQueryClient();

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={["boundTag"]} />
      </QueryClientProvider>,
    );

    await screen.findByTestId("tag_item_boundTag");

    rerender(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={["boundTag", "addedByHost"]} />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("tag_item_addedByHost"),
    ).toBeInTheDocument();
  });

  it("follows the room tags when the host mutates the array in place", async () => {
    // A store array handed down as a prop keeps its identity when it changes,
    // so the list cannot rely on the reference to tell it something happened.
    const roomTags = ["boundTag"];
    const queryClient = createQueryClient();

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={roomTags} />
      </QueryClientProvider>,
    );

    await screen.findByTestId("tag_item_boundTag");

    roomTags.push("addedInPlace");

    rerender(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={roomTags} />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("tag_item_addedInPlace"),
    ).toBeInTheDocument();
  });

  it("lists a renamed tag once, however long the room keeps the old name", async () => {
    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.rename();

    await waitFor(() => expect(updateTagName).toHaveBeenCalledTimes(1));
    // The query now says "renamed" while the room still says "freeTag". That
    // disagreement lasts until the host reloads the room, so whatever bridges
    // it has to last at least as long.
    await waitFor(() =>
      expect(queryClient.getQueryData(TAGS_QUERY_KEY)).toContain("renamed"),
    );

    const list = renderContent(fullAccess, queryClient);

    expect(await screen.findByTestId("tag_item_renamed")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_item_freeTag")).not.toBeInTheDocument();

    list.unmount();
    starter.unmount();
  });

  it("keeps a deleted tag out of the list while the room still carries it", async () => {
    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.remove("boundTag");

    await waitFor(() => expect(removeTagRequest).toHaveBeenCalledTimes(1));

    // boundTag is in roomTags, so only the delete record keeps it hidden.
    const list = renderContent(fullAccess, queryClient);

    await screen.findByTestId("tag_item_freeTag");
    expect(screen.queryByTestId("tag_item_boundTag")).not.toBeInTheDocument();

    list.unmount();
    starter.unmount();
  });
  it("keeps a freshly created tag unbound once it is unchecked", async () => {
    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);
    const list = renderContent(fullAccess, queryClient);

    await act(async () => {
      await starter.handlers.create("fresh");
    });

    await waitFor(() => expect(getCheckbox("fresh")).toBeChecked());

    // The create record says "bound", the later unbind says otherwise - and it
    // is the newer statement about the same label.
    await act(async () => {
      await starter.handlers.bind("fresh", false);
    });

    await waitFor(() => expect(removeTagsFromRoom).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getCheckbox("fresh")).not.toBeChecked());

    list.unmount();
    starter.unmount();
  });

  it("lists a tag under its own name again after it is renamed back", async () => {
    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.rename("freeTag", "renamed");
    await waitFor(() =>
      expect(queryClient.getQueryData(TAGS_QUERY_KEY)).toContain("renamed"),
    );

    starter.handlers.rename("renamed", "freeTag");
    await waitFor(() =>
      expect(queryClient.getQueryData(TAGS_QUERY_KEY)).toContain("freeTag"),
    );

    // Both rename records are still in the cache. The first one no longer
    // describes anything: the query calls the tag "freeTag" again.
    const list = renderContent(fullAccess, queryClient);

    expect(await screen.findByTestId("tag_item_freeTag")).toBeInTheDocument();
    expect(screen.queryByTestId("tag_item_renamed")).not.toBeInTheDocument();

    list.unmount();
    starter.unmount();
  });

  it("shows a deleted tag again when a tag of that name is created anew", async () => {
    const queryClient = createQueryClient();
    const starter = renderMutationStarter(queryClient);

    starter.handlers.remove("freeTag");

    await waitFor(() =>
      expect(queryClient.getQueryData(TAGS_QUERY_KEY)).not.toContain("freeTag"),
    );

    // Another room creates a tag of the same name, so the query has it back.
    // The delete record is stale from here on and must not hide it.
    act(() => {
      queryClient.setQueryData(TAGS_QUERY_KEY, ["boundTag", "freeTag"]);
    });

    const list = renderContent(fullAccess, queryClient);

    expect(await screen.findByTestId("tag_item_freeTag")).toBeInTheDocument();

    list.unmount();
    starter.unmount();
  });
  it("keeps the row in place when the tag is unbound and the host catches up", async () => {
    const queryClient = createQueryClient();
    // The room carries the tag the query lists last, so the two sources
    // disagree about the order - which is what makes the row move. The refetch
    // on mount has to answer with that same order.
    getTags.mockResolvedValue(["freeTag", "boundTag"]);
    queryClient.setQueryData(TAGS_QUERY_KEY, ["freeTag", "boundTag"]);

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={["boundTag"]} />
      </QueryClientProvider>,
    );

    await screen.findByTestId("tag_item_boundTag");
    expect(rowLabels()).toEqual(["boundTag", "freeTag"]);

    await userEvent.click(screen.getByTestId("tag_row_boundTag"));
    await waitFor(() => expect(removeTagsFromRoom).toHaveBeenCalledTimes(1));

    // The host reloads the room, which no longer reports the tag.
    rerender(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={[]} />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(getCheckbox("boundTag")).not.toBeChecked());
    expect(rowLabels()).toEqual(["boundTag", "freeTag"]);
  });

  it("keeps the row in place when the tag is renamed", async () => {
    const queryClient = createQueryClient();
    // Same disagreement as above: the room lists its tag first, the query lists
    // it last, so a row that loses its position would visibly move.
    getTags.mockResolvedValue(["freeTag", "boundTag"]);
    queryClient.setQueryData(TAGS_QUERY_KEY, ["freeTag", "boundTag"]);

    const starter = renderMutationStarter(queryClient);

    render(
      <QueryClientProvider client={queryClient}>
        <TagList access={fullAccess} roomTags={["boundTag"]} />
      </QueryClientProvider>,
    );

    await screen.findByTestId("tag_item_boundTag");
    expect(rowLabels()).toEqual(["boundTag", "freeTag"]);

    starter.handlers.rename("boundTag", "renamed");

    await waitFor(() => expect(rowLabels()).toEqual(["renamed", "freeTag"]));

    starter.unmount();
  });
  it("keeps the rename record past the default gc window", async () => {
    // The record is the only thing that can tell the list the name the room
    // still reports and the one the query already has are the same tag, and the
    // host is free never to reload the room - the client passes no
    // onTagsChanged. If the record is collected on the default five-minute
    // schedule, the tag starts being listed twice, under both names.
    vi.useFakeTimers();

    try {
      const queryClient = createQueryClient();
      const starter = renderMutationStarter(queryClient);

      starter.handlers.rename("freeTag", "renamed");

      // Settles on microtasks, which fake timers do not hold up.
      await act(async () => {});

      expect(queryClient.getQueryData(TAGS_QUERY_KEY)).toContain("renamed");

      starter.unmount();

      await act(async () => {
        vi.advanceTimersByTime(6 * 60 * 1000);
      });

      expect(
        queryClient
          .getMutationCache()
          .find({ mutationKey: TAG_RENAME_MUTATION_KEY }),
      ).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
