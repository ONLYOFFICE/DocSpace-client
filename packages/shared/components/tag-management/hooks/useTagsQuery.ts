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

import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useMutationState,
} from "@tanstack/react-query";

import {
  getTags,
  updateTagName,
  addTagsToRoom,
  removeTagRequest,
  removeTagsFromRoom,
} from "../../../api/rooms";

import type { TagType } from "@docspace/ui-kit/components/tag";

import type { TTag, UpdateTagNameParams } from "../TagManagement.types";
import { unionTagsData } from "../TagManagement.utils";
import {
  TAGS_QUERY_KEY,
  TAG_RENAME_MUTATION_KEY,
  TAG_REMOVE_MUTATION_KEY,
  getTagBindMutationKey,
  getTagCreateMutationKey,
  TAG_MUTATION_RECORD_GC_TIME,
} from "../TagManagement.constants";

export function useTagsQuery() {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: () => getTags() ?? Promise.resolve([]),
    refetchOnMount: true,
  });
}

export function useUpdateTagNameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: TAG_RENAME_MUTATION_KEY,
    // This record is what tells the list that the room's old name and the
    // query's new one are the same tag - see the constant.
    gcTime: TAG_MUTATION_RECORD_GC_TIME,

    mutationFn: ({ oldLabel, newLabel }: UpdateTagNameParams) =>
      updateTagName(oldLabel, newLabel),

    // Renamed in the shared list on success only, like creating and deleting:
    // applying it up front puts the new name in front of every other room while
    // the request may still fail, and leaves nothing showing the old one.
    onSuccess: async (_data, { oldLabel, newLabel }) => {
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });

      const previousData: string[] | undefined =
        queryClient.getQueryData(TAGS_QUERY_KEY);

      if (!previousData) return;

      queryClient.setQueryData(
        TAGS_QUERY_KEY,
        previousData.map((tag) => (tag === oldLabel ? newLabel : tag)),
      );
    },
  });
}

export function useCreateTagMutation(roomId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getTagCreateMutationKey(roomId),
    mutationFn: (newTag: string) => addTagsToRoom(roomId, [newTag]),
    // Added to the shared list on success only: until the server has it, the
    // tag does not exist for anybody else, and putting it in the tags query
    // would show it in every other room's list right away. The room creating
    // it still sees it immediately - see useRoomTagList.
    onSuccess: async (_data, newTag) => {
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });

      const previousData: string[] | undefined =
        queryClient.getQueryData(TAGS_QUERY_KEY);

      if (previousData?.includes(newTag)) return;

      queryClient.setQueryData(TAGS_QUERY_KEY, [
        newTag,
        ...(previousData ?? []),
      ]);
    },
  });
}

export function useRemoveTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: TAG_REMOVE_MUTATION_KEY,

    // Same reason as the rename: the deleted tag stays in the room's own data
    // until the host reloads it, and this record is what keeps it out of the
    // list in the meantime.
    gcTime: TAG_MUTATION_RECORD_GC_TIME,

    mutationFn: (removeTag: string) => removeTagRequest([removeTag]),

    // Dropped on success, not optimistically: removing the tag up front makes
    // it vanish from every other list the moment the request is sent, leaving
    // nothing to carry the loader while the delete is still running. Nothing
    // is changed before the answer, so there is also nothing to roll back.
    onSuccess: async (_data, removeTag) => {
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });

      const previousData: string[] | undefined =
        queryClient.getQueryData(TAGS_QUERY_KEY);

      if (!previousData) return;

      queryClient.setQueryData(
        TAGS_QUERY_KEY,
        previousData.filter((tag) => removeTag !== tag),
      );
    },
  });
}

export function useUpdateTag(roomId: string | number) {
  return useMutation({
    mutationKey: getTagBindMutationKey(roomId),
    mutationFn: (tag: TTag) => {
      const requestApi = tag.checked ? addTagsToRoom : removeTagsFromRoom;

      return requestApi(roomId, [tag.label]);
    },
  });
}

const isTag = (variables: unknown): variables is TTag =>
  typeof variables === "object" &&
  variables !== null &&
  "label" in variables &&
  typeof variables.label === "string" &&
  "checked" in variables &&
  typeof variables.checked === "boolean";

const isUpdateTagNameParams = (
  variables: unknown,
): variables is UpdateTagNameParams =>
  typeof variables === "object" &&
  variables !== null &&
  "oldLabel" in variables &&
  typeof variables.oldLabel === "string" &&
  "newLabel" in variables &&
  typeof variables.newLabel === "string";

type MutationSnapshot = {
  variables: unknown;
  isPending: boolean;
};

const selectSnapshot = (mutation: {
  state: { variables: unknown; status: string };
}): MutationSnapshot => ({
  variables: mutation.state.variables,
  isPending: mutation.state.status === "pending",
});

// A mutation counts towards the overlay while it runs and after it succeeded:
// its effect is real from the moment it is sent, and it stays true until the
// server data catches up. Failed ones drop out, which is the rollback.
const isApplied = (mutation: { state: { status: string } }) =>
  mutation.state.status === "pending" || mutation.state.status === "success";

export type TagMutationOverlay = {
  /** Tags being created here, newest first, in the order they were started. */
  created: readonly string[];
  /** Tags a delete is running for or has already removed. */
  removed: ReadonlySet<string>;
  /** Old label -> new label for renames. */
  renamed: ReadonlyMap<string, string>;
  /** Label -> the room membership a bind is applying. */
  bound: ReadonlyMap<string, boolean>;
  /** Labels with an operation still in flight, under both their names. */
  pending: ReadonlySet<string>;
};

/**
 * What the running (and just finished) mutations say about the tags, read from
 * the mutation cache.
 *
 * The cache belongs to the QueryClient, so this outlives the popup that started
 * an operation: progress and optimistic values show up in every list opened
 * afterwards, and no component has to keep a copy of them.
 *
 * Renaming and deleting a tag change it everywhere and count for every room.
 * Binding is scoped to `roomId` - the same tag can be bound in one room and not
 * in another.
 */
export function useTagMutationOverlay(
  roomId: string | number,
): TagMutationOverlay {
  const renaming = useMutationState({
    filters: { mutationKey: TAG_RENAME_MUTATION_KEY, predicate: isApplied },
    select: selectSnapshot,
  });

  const removing = useMutationState({
    filters: { mutationKey: TAG_REMOVE_MUTATION_KEY, predicate: isApplied },
    select: selectSnapshot,
  });

  const binding = useMutationState({
    filters: {
      mutationKey: getTagBindMutationKey(roomId),
      predicate: isApplied,
    },
    select: selectSnapshot,
  });

  const creating = useMutationState({
    filters: {
      mutationKey: getTagCreateMutationKey(roomId),
      predicate: isApplied,
    },
    select: selectSnapshot,
  });

  return useMemo(() => {
    const created: string[] = [];
    const removed = new Set<string>();
    const renamed = new Map<string, string>();
    const bound = new Map<string, boolean>();
    const pending = new Set<string>();

    renaming.forEach(({ variables, isPending }) => {
      if (!isUpdateTagNameParams(variables)) return;

      renamed.set(variables.oldLabel, variables.newLabel);

      // Both names count as busy: until the room data catches up, the list can
      // still be showing either one.
      if (isPending) {
        pending.add(variables.oldLabel);
        pending.add(variables.newLabel);
      }
    });

    removing.forEach(({ variables, isPending }) => {
      if (typeof variables !== "string") return;

      // Only drop the row once the delete went through: while it is running the
      // tag has to stay visible to carry its loader.
      if (isPending) pending.add(variables);
      else removed.add(variables);
    });

    binding.forEach(({ variables, isPending }) => {
      if (!isTag(variables)) return;

      bound.set(variables.label, variables.checked);
      if (isPending) pending.add(variables.label);
    });

    // A tag created here is bound to this room by the same request. It reaches
    // the tags query only once the server confirms it, so until then this is
    // the only thing that knows about it.
    creating.forEach(({ variables, isPending }) => {
      if (typeof variables !== "string") return;

      created.unshift(variables);
      bound.set(variables, true);
      if (isPending) pending.add(variables);
    });

    return { created, removed, renamed, bound, pending };
  }, [renaming, removing, binding, creating]);
}

export type RoomTagList = {
  tags: TTag[];
  pendingLabels: ReadonlySet<string>;
};

/**
 * The tags of a room, derived - never stored.
 *
 * Two sources feed it, each authoritative for one thing: the tags query knows
 * which tags exist and what they are called, the room knows which of them it
 * carries. Everything the user has just done is layered on top from the
 * mutation cache, so there is no second copy of the list to keep in sync and
 * nothing to roll back by hand.
 */
export function useRoomTagList(
  roomId: string | number,
  roomTags: Array<TagType | string>,
): RoomTagList {
  // Straight from the query, not through a prop: a snapshot taken by a parent
  // would miss the optimistic writes the mutations make into the same cache.
  const { data: fetchedTags } = useTagsQuery();

  const { created, removed, renamed, bound, pending } =
    useTagMutationOverlay(roomId);

  // `roomTags` comes from the host's store and can be an array that is mutated
  // in place, so its identity is not a reliable signal that it changed. Key the
  // derivation on what it actually holds instead.
  const roomTagsKey = roomTags
    .map((tag) =>
      typeof tag === "string"
        ? tag
        : `${tag.label}${tag.isDefault ? 1 : 0}`,
    )
    .join(" ");

  const tags = useMemo(() => {
    const result: TTag[] = [];
    const seen = new Set<string>();

    // A tag this room is creating leads the list before the server knows it.
    created.forEach((label) => {
      if (seen.has(label)) return;

      seen.add(label);
      result.push({ label, checked: true });
    });

    unionTagsData(roomTags, fetchedTags).forEach((tag) => {
      if (removed.has(tag.label)) return;

      // The room keeps the old name until the host reloads it, so the same tag
      // would otherwise be listed twice - under both names. The overlay says
      // which one won.
      const label = renamed.get(tag.label) ?? tag.label;

      if (seen.has(label)) return;
      seen.add(label);

      const checked = bound.get(label) ?? bound.get(tag.label) ?? tag.checked;

      result.push({ label, checked });
    });

    return result;
    // roomTagsKey stands in for roomTags: see above.
  }, [
    roomTagsKey,
    roomTags,
    fetchedTags,
    created,
    removed,
    renamed,
    bound,
    pending,
  ]);

  return { tags, pendingLabels: pending };
}

