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
  AuthenticationError,
  DecryptionError,
  KeyCheckUnavailableError,
  NoAccessError,
  KeyReplacedError,
} from "../errors";
import {
  clearGhostStateHandler,
  registerGhostStateHandler,
  reportPotentialGhostState,
  resetGhostStateGate,
} from "../ghost-state-notifier";

describe("A peer key that could not be checked is reported per operation", () => {
  const handler = vi.fn();

  beforeEach(() => {
    resetGhostStateGate();
    registerGhostStateHandler(handler);
  });

  afterEach(() => {
    clearGhostStateHandler();
    handler.mockClear();
  });

  it("Download, copy or preview with a sender key that could not be checked", () => {
    reportPotentialGhostState(new KeyCheckUnavailableError());

    expect(handler).not.toHaveBeenCalled();
  });

  it("Download, copy or preview with a sender key that could not be checked: a failed unwrap still raises the toast", () => {
    reportPotentialGhostState(new AuthenticationError());

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("Unreadable file", () => {
  const handler = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    resetGhostStateGate();
  });

  afterEach(() => {
    clearGhostStateHandler();
    handler.mockReset();
    vi.restoreAllMocks();
  });

  it.each([
    ["NoAccessError", () => new NoAccessError()],
    ["AuthenticationError", () => new AuthenticationError()],
  ])("%s raises the handler once per session", (_, error) => {
    registerGhostStateHandler(handler);

    reportPotentialGhostState(error());
    reportPotentialGhostState(error());
    reportPotentialGhostState(new NoAccessError());

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("File wrapped for a previous key", () => {
    registerGhostStateHandler(handler);

    reportPotentialGhostState(new KeyReplacedError());
    expect(handler).not.toHaveBeenCalled();

    reportPotentialGhostState(new NoAccessError());
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores any other error", () => {
    registerGhostStateHandler(handler);

    reportPotentialGhostState(new DecryptionError("chunk 0 failed"));
    reportPotentialGhostState(new Error("network"));
    reportPotentialGhostState("not an error");

    expect(handler).not.toHaveBeenCalled();
  });

  it("leaves the session gate unused while no handler is registered", () => {
    reportPotentialGhostState(new NoAccessError());

    registerGhostStateHandler(handler);
    reportPotentialGhostState(new NoAccessError());

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("lets the next report through after the gate is reset", () => {
    registerGhostStateHandler(handler);
    reportPotentialGhostState(new NoAccessError());

    resetGhostStateGate();
    reportPotentialGhostState(new NoAccessError());

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("still raises the handler when the session storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    registerGhostStateHandler(handler);

    reportPotentialGhostState(new NoAccessError());

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("logs a handler that throws and does not let it escape", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const failure = new Error("toast failed");
    registerGhostStateHandler(() => {
      throw failure;
    });

    expect(() => reportPotentialGhostState(new NoAccessError())).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      "[ghost-state] handler threw:",
      failure,
    );
  });
});
