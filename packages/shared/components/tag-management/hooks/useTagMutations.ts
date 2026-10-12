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
  useCreateTagMutation,
  useRemoveTagMutation,
  useUpdateTag,
  useUpdateTagNameMutation,
} from "./useTagsQuery";
import { useTagsPending } from "./useTagPending";

/**
 * The one set of tag mutations a list works through.
 *
 * Every `useMutation` call makes an observer of its own, so a hook called in
 * two places gives two independent pieces of state: a request started from one
 * of them leaves the other seeing nothing in flight. The search box and the
 * rows are two such places, and they have to agree on which rows are busy - so
 * the observers are made once, here, and handed to both through the provider.
 *
 * Each row waits on its own, though. Which tags are in flight is read from the
 * mutation cache rather than off the observers, which only ever remember their
 * latest call - see useTagPending - and every request is sent with
 * `mutateAsync`, whose promise belongs to that call and settles whatever else
 * was started meanwhile. So one slow row carries its own loader and holds up
 * nothing else, and closing the popup mid-request loses neither the loader nor
 * the answer.
 */
export function useTagMutations(roomId: string | number) {
  // The senders rather than the whole results: react-query keeps `mutateAsync`
  // referentially stable, while the result object is new on every render -
  // handing those out would make the context value, and every memo built on
  // it, change for nothing.
  const { mutateAsync: createTag } = useCreateTagMutation(roomId);
  const { mutateAsync: bindTag } = useUpdateTag(roomId);
  const { mutateAsync: renameTag } = useUpdateTagNameMutation();
  const { mutateAsync: removeTag } = useRemoveTagMutation();

  const pendingLabels = useTagsPending(roomId);

  return useMemo(
    () => ({
      createTag,
      bindTag,
      renameTag,
      removeTag,
      pendingLabels,
    }),
    [createTag, bindTag, renameTag, removeTag, pendingLabels],
  );
}

export type TagMutations = ReturnType<typeof useTagMutations>;
