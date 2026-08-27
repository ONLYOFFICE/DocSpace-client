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

import { useMemo, useRef } from "react";
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

import type {
  RoomTagList,
  TagMutationOverlay,
  TagRename,
  TTag,
  UpdateTagNameParams,
} from "../TagManagement.types";
import {
  isApplied,
  isTag,
  isUpdateTagNameParams,
  roomTagsToKey,
  selectSnapshot,
  unionTagsData,
} from "../TagManagement.utils";
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
    // query's new one are the same tag, so it has to outlive the host's stale
    // copy of the room - see the constant.
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

    // Same as the rename: the deleted tag stays in the room's own data until
    // the host reloads it, and this record is what keeps it out of the list in
    // the meantime.
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
    const renamed = new Map<string, TagRename>();
    const bound = new Map<string, boolean>();
    const pending = new Set<string>();

    renaming.forEach(({ variables, isPending }) => {
      if (!isUpdateTagNameParams(variables)) return;

      renamed.set(variables.oldLabel, { to: variables.newLabel, isPending });

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
      // Only if no bind has spoken since: unbinding a tag right after creating
      // it is a later decision about the same label, and a create record lives
      // long enough to outlast it.
      if (!bound.has(variables)) bound.set(variables, true);
      if (isPending) pending.add(variables);
    });

    return { created, removed, renamed, bound, pending };
  }, [renaming, removing, binding, creating]);
}

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

  // The position every label was first listed at, for as long as this list is
  // open. Binding a tag moves it between the two sources - the room reports it
  // or it does not - and unionTagsData lists the room's own tags first, so
  // without this the row would jump the moment the host reloads the room after
  // a toggle. Labels created here keep leading the list, under negative
  // positions, even after they arrive through the query.
  const orderRef = useRef({
    positions: new Map<string, number>(),
    nextTail: 0,
    nextLead: 0,
  });

  // Keyed on what roomTags holds, not on its identity - see roomTagsToKey.
  const roomTagsKey = roomTagsToKey(roomTags);

  const tags = useMemo(() => {
    const order = orderRef.current;
    const result: TTag[] = [];
    const seen = new Set<string>();

    const place = (label: string, lead: boolean) => {
      if (order.positions.has(label)) return;

      order.positions.set(
        label,
        lead ? (order.nextLead -= 1) : (order.nextTail += 1),
      );
    };

    // What the query says exists right now. A rename or a delete record is only
    // there to mask the room's stale copy of a tag, so it may be applied only
    // while the query and the room actually disagree - see below.
    const exists = new Set(fetchedTags);

    // Placed oldest first, so that the newest create takes the smallest
    // position and leads the list.
    for (let i = created.length - 1; i >= 0; i -= 1) place(created[i], true);

    // A tag this room is creating leads the list before the server knows it.
    created.forEach((label) => {
      if (seen.has(label)) return;

      seen.add(label);
      // Created means bound, unless a bind has said otherwise since.
      result.push({ label, checked: bound.get(label) ?? true });
    });

    unionTagsData(roomTags, fetchedTags).forEach((tag) => {
      // A delete counts only while the query has already dropped the tag: if
      // the label is back in the query it belongs to a tag created after this
      // one was deleted, and hiding it would make a live tag invisible.
      if (removed.has(tag.label) && !exists.has(tag.label)) return;

      // The room keeps the old name until the host reloads it, so the same tag
      // would otherwise be listed twice - under both names. A running rename is
      // shown right away, under the name it is applying. A finished one counts
      // only while the query has moved on and the room has not: once the tag is
      // called by its old name again - renamed back, or recreated under it -
      // the record describes something that is no longer true.
      const rename = renamed.get(tag.label);
      const label =
        rename !== undefined &&
        (rename.isPending ||
          (!exists.has(tag.label) && exists.has(rename.to)))
          ? rename.to
          : tag.label;

      if (seen.has(label)) return;
      seen.add(label);

      // A rename keeps the row where it was: it is the same tag under a new
      // name, and the new name is a position of its own otherwise.
      const previous = order.positions.get(tag.label);

      if (label !== tag.label && previous !== undefined) {
        if (!order.positions.has(label)) order.positions.set(label, previous);
      } else {
        place(label, false);
      }

      const checked = bound.get(label) ?? bound.get(tag.label) ?? tag.checked;

      result.push({ label, checked });
    });

    return result.sort(
      (a, b) =>
        (order.positions.get(a.label) ?? 0) -
        (order.positions.get(b.label) ?? 0),
    );
    // roomTagsKey stands in for roomTags: see above.
  }, [roomTagsKey, roomTags, fetchedTags, created, removed, renamed, bound]);

  return { tags, pendingLabels: pending };
}

