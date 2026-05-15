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

import { useState, useEffect, useRef, useCallback } from "react";

const MAX_LOG_ENTRIES = 200;

export const useEventLog = (frameId) => {
  const [eventLog, setEventLog] = useState([]);
  const idCounter = useRef(0);

  const onClear = useCallback(() => setEventLog([]), []);

  useEffect(() => {
    const handleMessage = (e) => {
      let parsed;
      try {
        parsed = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      if (parsed?.type !== "onEventReturn" || parsed?.frameId !== frameId)
        return;

      const { event, data } = parsed.eventReturnData ?? {};
      if (!event) return;

      idCounter.current += 1;

      setEventLog((prev) => {
        const next = [
          ...prev,
          {
            id: idCounter.current,
            timestamp: new Date(),
            event,
            data,
          },
        ];
        return next.length > MAX_LOG_ENTRIES
          ? next.slice(-MAX_LOG_ENTRIES)
          : next;
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [frameId]);

  return [eventLog, onClear];
};
