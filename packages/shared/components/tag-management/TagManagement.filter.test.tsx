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

import { TAGS_QUERY_KEY } from "./TagManagement.constants";

import { TagManagementProvider } from "./TagManagement.provider";
import { TagManagementFilter } from "./TagManagement.filter";
import { TagManagementContent } from "./TagManagement.content";
import type { AccessTagManagement } from "./TagManagement.types";

const { addTagsToRoom } = vi.hoisted(() => ({
  addTagsToRoom: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../api/rooms", () => ({
  addTagsToRoom,
  removeTagsFromRoom: vi.fn(() => Promise.resolve()),
  updateTagName: vi.fn(() => Promise.resolve()),
  removeTagRequest: vi.fn(() => Promise.resolve()),
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

const renderFilter = (onTagsChanged = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <TagManagementProvider roomTags={[]} roomId={ROOM_ID} access={fullAccess}>
        <TagManagementFilter
          roomId={ROOM_ID}
          roomName="Room"
          onTagsChanged={onTagsChanged}
        />
        <TagManagementContent roomId={ROOM_ID} />
      </TagManagementProvider>
    </QueryClientProvider>,
  );

  return { onTagsChanged, queryClient };
};

const createTag = async (label: string) => {
  const input = screen.getByRole("searchbox");

  await userEvent.type(input, label);
  await userEvent.keyboard("{Enter}");
};

describe("<TagManagementFilter /> creating tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds the created tag to the list", async () => {
    const { onTagsChanged } = renderFilter();

    await createTag("first");

    expect(addTagsToRoom).toHaveBeenCalledWith(ROOM_ID, ["first"]);
    expect(await screen.findByTestId("tag_item_first")).toBeInTheDocument();
    await waitFor(() => expect(onTagsChanged).toHaveBeenCalledTimes(1));
  });

  it("keeps every tag when several are created before the requests land", async () => {
    // Both creates are in flight at once: the second one used to replace the
    // first mutation on the shared observer, so its onSuccess never ran and the
    // first tag was lost.
    const resolvers: VoidFunction[] = [];
    addTagsToRoom.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve);
        }),
    );

    const { onTagsChanged } = renderFilter();

    await createTag("first");
    await createTag("second");

    await waitFor(() => expect(resolvers).toHaveLength(2));

    resolvers.forEach((resolve) => resolve());

    expect(await screen.findByTestId("tag_item_first")).toBeInTheDocument();
    expect(await screen.findByTestId("tag_item_second")).toBeInTheDocument();
    await waitFor(() => expect(onTagsChanged).toHaveBeenCalledTimes(2));
  });

  it("reports a failed create and adds nothing", async () => {
    addTagsToRoom.mockRejectedValueOnce(new Error("nope"));

    const { onTagsChanged } = renderFilter();

    await createTag("first");

    await waitFor(() => expect(addTagsToRoom).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("tag_item_first")).not.toBeInTheDocument();
    expect(onTagsChanged).not.toHaveBeenCalled();
  });

  it("shows the tag being created without putting it in the shared list yet", async () => {
    let resolveRequest: VoidFunction = () => {};
    addTagsToRoom.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { queryClient } = renderFilter();

    await createTag("first");

    // Visible here, with its loader, while the request runs...
    expect(await screen.findByTestId("tag_item_first")).toBeInTheDocument();
    expect(screen.getByTestId("tag_loader_first")).toBeInTheDocument();

    // ...but the tag does not exist for anybody else until the server says so.
    expect(queryClient.getQueryData(TAGS_QUERY_KEY)).not.toContain("first");

    resolveRequest();

    await waitFor(() =>
      expect(queryClient.getQueryData(TAGS_QUERY_KEY)).toContain("first"),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("tag_loader_first")).not.toBeInTheDocument(),
    );
  });

  it("does not add a failed tag to the shared list", async () => {
    addTagsToRoom.mockRejectedValueOnce(new Error("nope"));

    const { queryClient } = renderFilter();

    await createTag("first");

    await waitFor(() => expect(addTagsToRoom).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByTestId("tag_item_first")).not.toBeInTheDocument(),
    );
    expect(queryClient.getQueryData(TAGS_QUERY_KEY)).not.toContain("first");
  });
});
