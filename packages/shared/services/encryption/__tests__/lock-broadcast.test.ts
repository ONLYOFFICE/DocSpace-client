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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOCK_BROADCAST_SESSION_ID,
  broadcastLock,
  getLockBroadcastChannelName,
  subscribeLockBroadcast,
} from "../lock-broadcast";

/**
 * A BroadcastChannel of one browser: a message reaches every other open
 * channel of the same name, never the one that posted it.
 */
class FakeBroadcastChannel {
  static open = new Set<FakeBroadcastChannel>();

  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(public name: string) {
    FakeBroadcastChannel.open.add(this);
  }

  postMessage(data: unknown) {
    for (const channel of FakeBroadcastChannel.open) {
      if (channel !== this && channel.name === this.name) {
        channel.onmessage?.({ data } as MessageEvent);
      }
    }
  }

  close() {
    FakeBroadcastChannel.open.delete(this);
  }
}

/** A lock as a page of another tab sends it. */
const postFromAnotherTab = (userId: string, keysChanged?: boolean) => {
  const other = new FakeBroadcastChannel(getLockBroadcastChannelName(userId));
  other.postMessage({ type: "lock", sessionId: "another-tab", keysChanged });
  other.close();
};

describe("A lock reaches every tab of the user", () => {
  beforeEach(() => {
    FakeBroadcastChannel.open.clear();
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the channel name of the SDK pages", () => {
    expect(getLockBroadcastChannelName("user-1")).toBe(
      "docspace-encryption-lock:user-1",
    );
  });

  it("Message of this tab ignored", () => {
    const handler = vi.fn();
    subscribeLockBroadcast("user-1", handler);

    broadcastLock("user-1");

    expect(handler).not.toHaveBeenCalled();
  });

  it("Message of this tab ignored: a lock of another tab is heard", () => {
    const handler = vi.fn();
    subscribeLockBroadcast("user-1", handler);

    postFromAnotherTab("user-1");

    expect(handler).toHaveBeenCalledWith({ keysChanged: false });
  });

  it("Message of this tab ignored: what this tab sends carries its id", () => {
    const listener = new FakeBroadcastChannel(
      getLockBroadcastChannelName("user-1"),
    );
    const received = vi.fn();
    listener.onmessage = (event) => received(event.data);

    broadcastLock("user-1", { keysChanged: true });

    expect(received).toHaveBeenCalledWith({
      type: "lock",
      sessionId: LOCK_BROADCAST_SESSION_ID,
      keysChanged: true,
    });
  });

  it("Channel per user", () => {
    const first = vi.fn();
    const second = vi.fn();
    subscribeLockBroadcast("user-1", first);
    subscribeLockBroadcast("user-2", second);

    postFromAnotherTab("user-2");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("Key change carried", () => {
    const handler = vi.fn();
    subscribeLockBroadcast("user-1", handler);

    postFromAnotherTab("user-1", true);

    expect(handler).toHaveBeenCalledWith({ keysChanged: true });
  });

  it("ignores what is not a lock and stops after unsubscribing", () => {
    const handler = vi.fn();
    const unsubscribe = subscribeLockBroadcast("user-1", handler);
    const other = new FakeBroadcastChannel(
      getLockBroadcastChannelName("user-1"),
    );

    other.postMessage({ type: "unlock", sessionId: "another-tab" });
    other.postMessage(null);
    unsubscribe();
    other.postMessage({ type: "lock", sessionId: "another-tab" });

    expect(handler).not.toHaveBeenCalled();
    expect(FakeBroadcastChannel.open.size).toBe(1);
  });

  it("does nothing where the browser has no BroadcastChannel", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const handler = vi.fn();

    const unsubscribe = subscribeLockBroadcast("user-1", handler);
    broadcastLock("user-1");
    unsubscribe();

    expect(handler).not.toHaveBeenCalled();
  });
});
