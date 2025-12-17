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

import type { TEditorConnector, TEditorAIEvent } from "@/types";
import { getCookie } from "@docspace/shared/utils";

const requests: Record<string, AbortController> = {};

const sendEvent = (
  connector: TEditorConnector,
  data: Record<string, unknown>,
) => connector.sendEvent("ai_onExternalFetch", data);

const streamResponse = async (
  connector: TEditorConnector,
  id: string,
  body: ReadableStream<Uint8Array>,
) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  for (;;) {
    const { value, done } = await reader.read();

    if (done) break;

    if (value)
      sendEvent(connector, { type: "chunk", id, chunk: decoder.decode(value) });
  }

  sendEvent(connector, { type: "end", id });
};

const externalAIFetch = async (
  connector: TEditorConnector,
  e: TEditorAIEvent,
  providerId: number,
) => {
  const { id, type, url, options, streaming } = e;

  if (type === "abort") {
    requests[id]?.abort();
    delete requests[id];
    return;
  }

  const controller = new AbortController();
  requests[id] = controller;

  try {
    const authToken = getCookie("asc_auth_key");
    const result = await fetch(
      url.replace("[external]", `/api/2.0/ai/openai/${providerId}/v1`),
      {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          ...(authToken && { Authorization: authToken }),
        },
      },
    );

    const headers = Object.fromEntries(result.headers.entries());

    sendEvent(connector, {
      type: "response",
      id,
      status: result.status,
      headers,
    });

    if (streaming) {
      if (!result.body) throw new Error("Response body is null");

      await streamResponse(connector, id, result.body);
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
    sendEvent(connector, { type: "error", id, error: String(err) });
  } finally {
    delete requests[id];
  }
};

export default externalAIFetch;
