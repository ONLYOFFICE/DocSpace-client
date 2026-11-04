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

import { describe, it, expect, vi, beforeEach } from "vitest";

import SocketHelper from "@onlyoffice/apps-ui-kit/utils/socket";

import {
  createModuleEvents,
  releaseModuleEvents,
  setModuleEventDispatcher,
} from "SRC_DIR/helpers/plugins/react/socket";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", () => ({
  default: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  SocketCommands: { Subscribe: "subscribe", Unsubscribe: "unsubscribe" },
}));

const helper = vi.mocked(SocketHelper!);

const listenerAt = (index: number) =>
  helper.on.mock.calls[index][1] as unknown as (data?: {
    message?: string;
  }) => Promise<void>;

describe("plugin module events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    releaseModuleEvents("cws-mail");
    releaseModuleEvents("cws-chat");
    vi.clearAllMocks();
  });

  it("listens for the namespaced module event", () => {
    createModuleEvents("cws-mail").on("mail", "new-mail", () => {});

    expect(helper.on.mock.calls[0][0]).toBe("plugin:mail:new-mail");
  });

  it("dispatches what the handler returns on behalf of the plugin the object was made for", async () => {
    const dispatch = vi.fn();
    setModuleEventDispatcher(dispatch);
    const reply = { actions: ["updateArticleNavigationItems"] };
    const handler = vi.fn(() => reply as never);

    createModuleEvents("cws-mail").on("mail", "new-mail", handler);
    await listenerAt(0)({ message: "3" });

    expect(handler).toHaveBeenCalledWith("3");
    expect(dispatch).toHaveBeenCalledWith({ message: reply, pluginName: "cws-mail" });
  });

  it("keeps a throwing handler from reaching the socket", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    createModuleEvents("cws-mail").on("mail", "new-mail", () => {
      throw new Error("boom");
    });

    await expect(listenerAt(0)({ message: "x" })).resolves.toBeUndefined();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("stops listening with the function it returns, once", () => {
    const stop = createModuleEvents("cws-mail").on("mail", "new-mail", () => {});
    stop();
    stop();

    expect(helper.off).toHaveBeenCalledTimes(1);
    expect(helper.off.mock.calls[0][1]).toBe(helper.on.mock.calls[0][1]);
  });

  it("drops every subscription of a released plugin and only of that plugin", () => {
    const mail = createModuleEvents("cws-mail");
    mail.on("mail", "new-mail", () => {});
    mail.subscribeRoom("mail", "shared-inbox");
    createModuleEvents("cws-chat").on("chat", "new-message", () => {});

    releaseModuleEvents("cws-mail");

    expect(helper.off).toHaveBeenCalledTimes(1);
    expect(helper.off.mock.calls[0][0]).toBe("plugin:mail:new-mail");
    expect(helper.emit).toHaveBeenLastCalledWith("unsubscribe", { roomParts: "plugin-mail-shared-inbox" });
  });

  it("replaces the previous load's subscriptions when the plugin is loaded again", () => {
    createModuleEvents("cws-mail").on("mail", "new-mail", () => {});
    createModuleEvents("cws-mail");

    expect(helper.off).toHaveBeenCalledTimes(1);
  });

  it("refuses names the server would never send", () => {
    const events = createModuleEvents("cws-mail");

    expect(() => events.on("mail:x", "e", () => {})).toThrow(/module/);
    expect(() => events.on("mail", "", () => {})).toThrow(/event/);
    expect(() => events.subscribeRoom("mail", "../DIR-1")).toThrow(/room/);
  });

  it("leaves a room only when the last plugin holding it lets it go", () => {
    createModuleEvents("cws-mail").subscribeRoom("mail", "shared-inbox");
    const leaveChat = createModuleEvents("cws-chat").subscribeRoom("mail", "shared-inbox");

    expect(helper.emit).toHaveBeenCalledTimes(1);

    leaveChat();
    expect(helper.emit).toHaveBeenCalledTimes(1);

    releaseModuleEvents("cws-mail");
    expect(helper.emit).toHaveBeenLastCalledWith("unsubscribe", { roomParts: "plugin-mail-shared-inbox" });
    expect(helper.emit).toHaveBeenCalledTimes(2);
  });

  it("joins and leaves the module room of the portal", () => {
    const leave = createModuleEvents("cws-mail").subscribeRoom("mail", "shared-inbox");
    leave();

    expect(helper.emit).toHaveBeenNthCalledWith(1, "subscribe", { roomParts: "plugin-mail-shared-inbox" });
    expect(helper.emit).toHaveBeenNthCalledWith(2, "unsubscribe", { roomParts: "plugin-mail-shared-inbox" });
  });
});
