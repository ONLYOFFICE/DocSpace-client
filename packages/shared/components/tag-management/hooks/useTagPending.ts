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
import { useMutationState } from "@tanstack/react-query";

import {
  RENAME_TAG_MUTATION_KEY,
  REMOVE_TAG_MUTATION_KEY,
  roomTagMutationKey,
} from "../TagManagement.constants";

/**
 * Which tags are waiting on a request, read from the mutation cache.
 *
 * The cache belongs to the query client, which sits above the popup, so a
 * request outlives the list it was started from: close the popup mid-request
 * and open it again, and the row is still marked. State kept beside the
 * mutations could not do that - it goes with the popup that held it.
 *
 * The requests are asked about in two scopes, because their reach differs: a
 * bind or a create is sent for one room and only that room waits on it, while
 * a rename or a removal changes the tag itself, wherever it is used.
 */

// The variables of each mutation, in the shape that mutation sends them: a
// bare label for a create and a removal, `{ label }` for a bind, and for a
// rename the new name - the row has already been renamed on screen.
const labelOf = (variables: unknown): string | undefined => {
  if (typeof variables === "string") return variables;

  if (typeof variables !== "object" || variables === null) return undefined;

  if ("newLabel" in variables && typeof variables.newLabel === "string") {
    return variables.newLabel;
  }

  if ("label" in variables && typeof variables.label === "string") {
    return variables.label;
  }

  return undefined;
};

const isSameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) =>
  a.size === b.size && [...a].every((label) => b.has(label));

const useLabelsInFlight = (mutationKey: readonly unknown[]) => {
  const variables = useMutationState({
    filters: { mutationKey, status: "pending" },
    select: (mutation) => mutation.state.variables,
  });

  // The same set object back while the names are the same, compared as sets
  // rather than as some string they were joined into: a name is whatever the
  // server accepted, and a separator it could contain would split one name
  // into two. `useMutationState` hands back a new array on every render, so
  // without this every memo built on the set would be rebuilt on every render.
  const next = new Set(
    variables.map(labelOf).filter((label) => label !== undefined),
  );

  const kept = useRef<ReadonlySet<string>>(next);

  if (!isSameSet(next, kept.current)) kept.current = next;

  return kept.current;
};

/** The tags this list is waiting on, whichever request they were sent by. */
export const useTagsPending = (
  roomId: string | number,
): ReadonlySet<string> => {
  const room = useLabelsInFlight(roomTagMutationKey(roomId));
  const renaming = useLabelsInFlight(RENAME_TAG_MUTATION_KEY);
  const removing = useLabelsInFlight(REMOVE_TAG_MUTATION_KEY);

  return useMemo(() => {
    const waiting = [...room, ...renaming, ...removing];

    return new Set(waiting);
  }, [room, renaming, removing]);
};
