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

import { useRef, useState, type PointerEvent } from "react";

import type { TDragState } from "../types";
import { getInsertPosition, toMoveIndex } from "../utils";

export const useDragReorder = (
  count: number,
  onMove: (from: number, to: number) => void,
) => {
  const rowsRef = useRef<(HTMLElement | null)[]>([]);
  const [drag, setDrag] = useState<TDragState | null>(null);

  const getMidpoints = () =>
    rowsRef.current.slice(0, count).map((row) => {
      const rect = row?.getBoundingClientRect();

      return rect ? rect.top + rect.height / 2 : Number.POSITIVE_INFINITY;
    });

  const getHandleProps = (index: number) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ from: index, position: index });
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (drag?.from !== index) return;

      const position = getInsertPosition(getMidpoints(), e.clientY);
      if (position !== drag.position) setDrag({ from: index, position });
    },
    onPointerUp: () => {
      if (drag?.from !== index) return;

      const to = toMoveIndex(drag);
      setDrag(null);
      if (to !== drag.from) onMove(drag.from, to);
    },
    onPointerCancel: () => setDrag(null),
  });

  const getRowRef = (index: number) => (row: HTMLElement | null) => {
    rowsRef.current[index] = row;
  };

  return { drag, getHandleProps, getRowRef };
};
