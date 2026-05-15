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

import { getCookie } from "@docspace/ui-kit/utils/cookie";
import type { TEditorAIEvent, TEditorConnector } from "@/types";

const requests: Record<string, { controller: AbortController }> = {};

export function abortAllRequests() {
  for (const id of Object.keys(requests)) {
    requests[id]?.controller.abort();
    delete requests[id];
  }
}

const sendEvent = (
  connector: TEditorConnector,
  data: Record<string, unknown>,
) => connector.sendEvent("ai_onExternalFetch", data);

const externalAIFetch = async (
  connector: TEditorConnector,
  e: TEditorAIEvent,
  providerId: number,
) => {
  const { id, type } = e;

  if (type === "abort") {
    requests[id]?.controller.abort();
    delete requests[id];
    return;
  }

  const abortController = new AbortController();
  requests[id] = { controller: abortController };

  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const url = e.url.replace(
      "[external]",
      `/api/2.0/ai/openai/${providerId}/v1`,
    );
    const authToken = getCookie("asc_auth_key");

    const options = {
      ...e.options,
      signal: abortController.signal,
      headers: {
        ...e.options.headers,
        ...(authToken && { Authorization: authToken }),
      },
    };

    const result = await fetch(url, options);
    const headers = Object.fromEntries(result.headers.entries());

    if (e.streaming) {
      sendEvent(connector, {
        type: "response",
        id,
        status: result.status,
        headers,
      });

      if (!result.body) throw new Error("Response body is null");

      reader = result.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        let value;
        try {
          const { value: readerValue, done: readerDone } = await reader.read();
          value = readerValue;
          done = readerDone;
        } catch {
          break;
        }

        if (value) {
          sendEvent(connector, {
            type: "chunk",
            id,
            chunk: decoder.decode(value, { stream: true }),
          });
        }
      }

      const remaining = decoder.decode();

      if (remaining) {
        sendEvent(connector, { type: "chunk", id, chunk: remaining });
      }

      sendEvent(connector, { type: "end", id });
    } else {
      sendEvent(connector, {
        type: "response",
        id,
        status: result.status,
        headers,
        body: await result.text(),
      });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      sendEvent(connector, { type: "aborted", id });
    } else {
      sendEvent(connector, { type: "error", id, error: String(err) });
    }
  } finally {
    if (reader) {
      try {
        reader.releaseLock();
      } catch {}
    }

    delete requests[id];
  }
};

export default externalAIFetch;
