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

import { useCallback, useEffect } from "react";

import type { FilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

type UseResetSelectionClickProps = {
  setSelection: FilesSelectionStore["setSelection"];
  setBufferSelection: FilesSelectionStore["setBufferSelection"];
};

export default function useResetSelectionClick({
  setSelection,
  setBufferSelection,
}: UseResetSelectionClickProps) {
  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;

      if (
        (e.target.closest(".scroll-body") &&
          !e.target.closest(".files-item") &&
          !e.target.closest(".not-selectable") &&
          !e.target.closest(".info-panel") &&
          !e.target.closest(".table-container_group-menu") &&
          !e.target.closest(".document-catalog")) ||
        e.target.closest(".files-main-button") ||
        e.target.closest(".add-button") ||
        e.target.closest("#filter_search-input")
      ) {
        setSelection([]);
        setBufferSelection(null);
      }
    },
    [setSelection, setBufferSelection],
  );

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [onMouseDown]);
}
