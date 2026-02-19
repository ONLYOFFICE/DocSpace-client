// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getTags,
  updateTagName,
  addTagsToRoom,
  removeTagRequest,
  removeTagsFromRoom,
} from "../../../api/rooms";

import type { TTag, UpdateTagNameParams } from "../TagManagement.types";
import { TAGS_QUERY_KEY } from "../TagManagement.constants";

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
    mutationFn: (removeTag: string) => removeTagRequest([removeTag]),

    onMutate: async (removeTag: string) => {
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });

      const previousData: string[] | undefined =
        queryClient.getQueryData(TAGS_QUERY_KEY);

      if (previousData) {
        queryClient.setQueryData(
          TAGS_QUERY_KEY,
          previousData.filter((tag) => removeTag !== tag),
        );
      }

      return { previousData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(TAGS_QUERY_KEY, context?.previousData);
    },
  });
}

export function useUpdateTag(roomId: string | number) {
  return useMutation({
    mutationFn: (tag: TTag) => {
      const requestApi = tag.checked ? addTagsToRoom : removeTagsFromRoom;

      return requestApi(roomId, [tag.label]);
    },
  });
}
