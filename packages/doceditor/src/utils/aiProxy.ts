// (c) Copyright Ascensio System SIA 2009-2025
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
