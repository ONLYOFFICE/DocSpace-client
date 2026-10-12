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

import { describe, it, expect, afterEach } from "vitest";

import {
  registerCryptoOperation,
  releaseCryptoOperation,
  abortAllCryptoOperations,
  getActiveCryptoOperationCount,
} from "./abort-registry";

afterEach(() => {
  abortAllCryptoOperations("test-cleanup");
});

describe("abort-registry", () => {
  it("tracks the active operation count", () => {
    expect(getActiveCryptoOperationCount()).toBe(0);
    registerCryptoOperation();
    registerCryptoOperation();
    expect(getActiveCryptoOperationCount()).toBe(2);
  });

  it("returns a fresh, un-aborted AbortController per registration", () => {
    const a = registerCryptoOperation();
    const b = registerCryptoOperation();
    expect(a).not.toBe(b);
    expect(a.signal.aborted).toBe(false);
    expect(b.signal.aborted).toBe(false);
  });

  it("release removes a single controller without aborting it", () => {
    const a = registerCryptoOperation();
    registerCryptoOperation();
    releaseCryptoOperation(a);
    expect(getActiveCryptoOperationCount()).toBe(1);
    expect(a.signal.aborted).toBe(false);
  });

  it("abortAll aborts every controller and empties the registry", () => {
    const a = registerCryptoOperation();
    const b = registerCryptoOperation();
    abortAllCryptoOperations("lock");
    expect(a.signal.aborted).toBe(true);
    expect(b.signal.aborted).toBe(true);
    expect(getActiveCryptoOperationCount()).toBe(0);
  });

  it("propagates the abort reason to signals", () => {
    const a = registerCryptoOperation();
    abortAllCryptoOperations("lock");
    expect(a.signal.reason).toBe("lock");
  });

  it("abortAll is safe to call with no active operations", () => {
    expect(() => abortAllCryptoOperations("noop")).not.toThrow();
    expect(getActiveCryptoOperationCount()).toBe(0);
  });
});
