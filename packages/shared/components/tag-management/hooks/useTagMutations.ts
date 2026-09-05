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

/**
 * The one set of tag mutations a list works through.
 *
 * Every `useMutation` call makes an observer of its own, so a hook called in
 * two places gives two independent pieces of state: a request started from one
 * of them leaves the other reading `isPending: false`. The search box and the
 * rows are two such places, and they have to agree on what is in flight - the
 * row's loader and the "one request at a time" rule are both that answer. So
 * the observers are made once, here, and handed to both through the provider.
 */
export function useTagMutations(roomId: string | number) {
  const createTag = useCreateTagMutation(roomId);
  const updateTag = useUpdateTag(roomId);
  const updateTagName = useUpdateTagNameMutation();
  const removeTag = useRemoveTagMutation();

  // The row whose request is out, read from the mutations themselves rather
  // than kept alongside them: react-query already knows both which tag was
  // sent and whether the answer is still coming.
  //
  // A create counts too. Its row is on screen before the server has heard of
  // it, and it is the one row that must not be clicked - there is nothing yet
  // to bind or unbind.
  const pendingLabel = useMemo(() => {
    if (createTag.isPending) {
      return createTag.variables;
    }

    if (updateTag.isPending) {
      return updateTag.variables.label;
    }

    // The new name, not the old one: the row has already been renamed on
    // screen, and this has to name the row as it now reads.
    if (updateTagName.isPending) {
      return updateTagName.variables.newLabel;
    }

    if (removeTag.isPending) {
      return removeTag.variables;
    }
    // The variables are listed as well as the flags: they are read above, and
    // react-query sets them in the same render that raises isPending - which
    // is easy to read as a forgotten dependency otherwise.
  }, [
    createTag.isPending,
    createTag.variables,
    updateTag.isPending,
    updateTag.variables,
    updateTagName.isPending,
    updateTagName.variables,
    removeTag.isPending,
    removeTag.variables,
  ]);

  // The senders rather than the whole results: react-query keeps `mutate` and
  // `mutateAsync` referentially stable, while the result object is new on
  // every render - handing those out would make the context value, and every
  // memo built on it, change for nothing.
  return useMemo(
    () => ({
      createTag: createTag.mutate,
      bindTag: updateTag.mutate,
      renameTag: updateTagName.mutateAsync,
      removeTag: removeTag.mutateAsync,
      pendingLabel,
      // Nothing new is started while a request is out: a second mutate on the
      // same observer detaches the first call, and with it the rollback that
      // would undo its optimistic write.
      isPending: pendingLabel !== undefined,
    }),
    [
      createTag.mutate,
      updateTag.mutate,
      updateTagName.mutateAsync,
      removeTag.mutateAsync,
      pendingLabel,
    ],
  );
}

export type TagMutations = ReturnType<typeof useTagMutations>;
