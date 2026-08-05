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

import { describe, it, expect } from "vitest";

import { parseSseStream } from "./parseSseStream";
import type { SseEvent } from "./sseEvent";

function makeStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

function makeThrowingStream(
  chunks: string[],
): ReadableStream<Uint8Array> {
  let i = 0;
  const encoder = new TextEncoder();
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i++]));
      } else {
        controller.error(new Error("simulated transport error"));
      }
    },
  });
}

function makeChunkedStream(chunks: string[]): ReadableStream<Uint8Array> {
  let i = 0;
  const encoder = new TextEncoder();
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i++]));
      } else {
        controller.close();
      }
    },
  });
}

async function collect(
  stream: ReadableStream<Uint8Array>,
): Promise<SseEvent[]> {
  const events: SseEvent[] = [];
  for await (const ev of parseSseStream(stream)) events.push(ev);
  return events;
}

describe("parseSseStream", () => {
  it("parses a single message_start event", async () => {
    const text = `event: message_start\ndata: {"chatId":"abc-123"}\n\n`;
    const events = await collect(makeStream(text));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "message_start", chatId: "abc-123" });
  });

  it("parses multiple sequential events", async () => {
    const text = [
      `event: message_start\ndata: {"chatId":"c"}\n\n`,
      `event: new_token\ndata: {"text":"Hello "}\n\n`,
      `event: new_token\ndata: {"text":"world"}\n\n`,
      `event: message_stop\ndata: {"messageId":42}\n\n`,
    ].join("");
    const events = await collect(makeStream(text));
    expect(events.map((e) => e.type)).toEqual([
      "message_start",
      "new_token",
      "new_token",
      "message_stop",
    ]);
  });

  it("ignores keep-alive comment lines", async () => {
    const text =
      `: ping - 2026-01-01T00:00:00Z\n\n` +
      `event: new_token\ndata: {"text":"x"}\n\n`;
    const events = await collect(makeStream(text));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "new_token", text: "x" });
  });

  it("handles events split across chunks", async () => {
    const events = await collect(
      makeChunkedStream([
        `event: new_to`,
        `ken\ndata: {"text":"hi`,
        `"}\n\nevent: message_stop\n`,
        `data: {"messageId":1}\n\n`,
      ]),
    );
    expect(events.map((e) => e.type)).toEqual(["new_token", "message_stop"]);
    expect((events[0] as { type: "new_token"; text: string }).text).toBe("hi");
  });

  it("skips events with malformed JSON data", async () => {
    const text =
      `event: bad\ndata: { not json\n\n` +
      `event: new_token\ndata: {"text":"ok"}\n\n`;
    const events = await collect(makeStream(text));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("new_token");
  });

  it("emits a trailing event without a final blank line", async () => {
    const text = `event: new_token\ndata: {"text":"final"}`;
    const events = await collect(makeStream(text));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("new_token");
  });

  it("handles \\r\\n line endings", async () => {
    const text = `event: new_token\r\ndata: {"text":"crlf"}\r\n\r\n`;
    const events = await collect(makeStream(text));
    expect(events[0]).toEqual({ type: "new_token", text: "crlf" });
  });

  it("returns after message_stop and ignores trailing transport errors", async () => {
    const stream = makeThrowingStream([
      `event: new_token\ndata: {"text":"hi"}\n\n`,
      `event: message_stop\ndata: {"messageId":1}\n\n`,
    ]);
    const events = await collect(stream);
    expect(events.map((e) => e.type)).toEqual([
      "new_token",
      "message_stop",
    ]);
  });

  it("skips blocks with data but no event field", async () => {
    const text = `data: {"text":"orphan"}\n\nevent: new_token\ndata: {"text":"ok"}\n\n`;
    const events = await collect(makeStream(text));
    expect(events).toHaveLength(1);
  });
});
