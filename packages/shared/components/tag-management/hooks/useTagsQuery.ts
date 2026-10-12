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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getTags,
  updateTagName,
  addTagsToRoom,
  removeTagRequest,
  removeTagsFromRoom,
} from "../../../api/rooms";

import type { TTag, UpdateTagNameParams } from "../TagManagement.types";
import {
  TAGS_QUERY_KEY,
  RENAME_TAG_MUTATION_KEY,
  REMOVE_TAG_MUTATION_KEY,
  roomTagMutationKey,
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
    mutationKey: RENAME_TAG_MUTATION_KEY,
    mutationFn: ({ oldLabel, newLabel }: UpdateTagNameParams) =>
      updateTagName(oldLabel, newLabel),

    onMutate: async ({ oldLabel, newLabel }: UpdateTagNameParams) => {
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });

      const previousData: string[] | undefined =
        queryClient.getQueryData(TAGS_QUERY_KEY);

      const optimisticTags = previousData?.map((tag) =>
        tag === oldLabel ? newLabel : tag,
      );

      queryClient.setQueryData(TAGS_QUERY_KEY, optimisticTags);

      return { previousData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(TAGS_QUERY_KEY, context?.previousData);
    },
  });
}

export function useCreateTagMutation(roomId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    // The room's own key: a tag created here is added to this room.
    mutationKey: roomTagMutationKey(roomId),
    mutationFn: (newTag: string) => addTagsToRoom(roomId, [newTag]),

    onMutate: async (newTag: string) => {
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });
      const previousData: string[] | undefined =
        queryClient.getQueryData(TAGS_QUERY_KEY);
      queryClient.setQueryData(TAGS_QUERY_KEY, [
        newTag,
        ...(previousData || []),
      ]);
      return { previousData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(TAGS_QUERY_KEY, context?.previousData);
    },
  });
}

export function useRemoveTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: REMOVE_TAG_MUTATION_KEY,
    mutationFn: (removeTag: string) => removeTagRequest([removeTag]),

    // Nothing is written yet - but a list already on its way is stopped, or it
    // would land after the delete and put the tag back into the cache.
    onMutate: () => queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY }),

    // Taken out on the answer, not before it: unlike a create or a rename, the
    // row this is about stays on screen with its loader until the tag is
    // really gone, and the cached list has to say the same - otherwise
    // reopening the popup mid-request would show it already gone.
    onSuccess: (_, removeTag: string) => {
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
    mutationKey: roomTagMutationKey(roomId),
    mutationFn: (tag: TTag) => {
      const requestApi = tag.checked ? addTagsToRoom : removeTagsFromRoom;

      return requestApi(roomId, [tag.label]);
    },
  });
}
