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

import { useCallback, useLayoutEffect, useState } from "react";

import { fadeSectionIn, hideSection } from "./sectionFade";

/** Long enough for the caption to be read, not just seen. */
const PREPARING_MS = 1500;

/** Holds a loader over the section while the tour swaps its list for the demo. */
export default function useDemoSwap(isStarting: boolean) {
  const [isSwapping, setIsSwapping] = useState(false);

  // Hidden before the browser paints the screen the demo stands in for.
  useLayoutEffect(() => {
    if (isStarting) hideSection();
  }, [isStarting]);

  const runSwap = useCallback(
    // `swap` puts the demo list in place of the section's own.
    async (swap: () => Promise<unknown> | void) => {
      setIsSwapping(true);

      try {
        await Promise.all([
          swap(),
          // Keeps the loader up when the swap answers instantly.
          new Promise((resolve) => {
            setTimeout(resolve, PREPARING_MS);
          }),
        ]);
      } finally {
        setIsSwapping(false);
        // Shows what the swap brought in; the section was hidden above.
        fadeSectionIn();
      }
    },
    [],
  );

  return { isPreparing: isStarting || isSwapping, runSwap };
}
