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


import { useCallback, useEffect, useRef } from "react";
import type { TFunction } from "i18next";

import { getRoomCandidateKeys } from "@docspace/shared/api/privacy";

/** Ids asked for in one request, which keeps its query string short. */
export const CANDIDATE_KEYS_BATCH_SIZE = 40;

type TMark = { label: string; description: string };
type TPerson = { id?: string | null };

/**
 * The marks of the people of a private room's invite list who have no
 * encryption key, decided per loaded page from the keys of the invitation
 * candidates. The answers are kept while the panel is open; a failed batch
 * marks nobody and is asked again with the next page that holds its people.
 * Spec: private-rooms/room-membership, "The mark of a missing key follows the server's answer"
 */
export const useMissingKeyMarks = ({
  roomId,
  isPrivateRoom,
  t,
}: {
  roomId: string | number | null | undefined;
  isPrivateRoom: boolean;
  t: TFunction;
}) => {
  // Whether each person asked about holds a key.
  const hasKeyRef = useRef(new Map<string, boolean>());

  useEffect(() => {
    hasKeyRef.current = new Map();
  }, [roomId]);

  const getItemMarks = useCallback(
    async (people: TPerson[]): Promise<Record<string, TMark>> => {
      if (roomId == null) return {};
      const known = hasKeyRef.current;
      const ids = Array.from(
        new Set(
          people.flatMap((person) => (person.id ? [String(person.id)] : [])),
        ),
      );
      const unknown = ids.filter((id) => !known.has(id));

      const batches: string[][] = [];
      for (let i = 0; i < unknown.length; i += CANDIDATE_KEYS_BATCH_SIZE)
        batches.push(unknown.slice(i, i + CANDIDATE_KEYS_BATCH_SIZE));

      await Promise.all(
        batches.map(async (batch) => {
          try {
            const keys = await getRoomCandidateKeys(roomId, batch);
            const withKey = new Set(
              keys.filter((key) => key.publicKey).map((key) => key.userId),
            );
            for (const id of batch) known.set(id, withKey.has(id));
          } catch {
            // Left unknown: no mark, and asked again with a later page.
          }
        }),
      );

      const mark: TMark = {
        label: t("Common:NoKey"),
        description: t("Common:NoEncryptionKeyMarkHint"),
      };
      const marks: Record<string, TMark> = {};
      for (const id of ids) if (known.get(id) === false) marks[id] = mark;
      return marks;
    },
    [roomId, t],
  );

  return isPrivateRoom ? getItemMarks : undefined;
};
