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

import { describe, it, expect, vi } from "vitest";

// The store reads the interface language from authStore on every call.
const auth = vi.hoisted(() => ({ language: "en" }));

vi.mock("@docspace/shared/store", () => ({
  authStore: auth,
  settingsStore: {},
}));

import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { TAiToolsPrices } from "@onlyoffice/apps-ui-kit/billing/types";

import ServicesStore from "../ServicesStore";
import type PaymentStore from "../PaymentStore";

const ARABIC_INDIC_DIGIT = /[\u0660-\u0669]/;
const FIRST_STRONG_ISOLATE = "\u2068";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

const createStore = (currency = "USD") => {
  const store = new ServicesStore(
    {} as CurrentTariffStatusStore,
    {} as PaymentStore,
  );
  store.aiToolsPrices = {
    currency: { code: currency, symbol: "$" },
  } as unknown as TAiToolsPrices;
  return store;
};

describe("ServicesStore.formatAiModelsCurrency", () => {
  it("prints an ar-SA price in Western digits, its currency symbol isolated", () => {
    auth.language = "ar-SA";

    const price = createStore("USD").formatAiModelsCurrency(1234.5);

    expect(price).not.toMatch(ARABIC_INDIC_DIGIT);
    expect(price).toContain(
      `${FIRST_STRONG_ISOLATE}US$${POP_DIRECTIONAL_ISOLATE}`,
    );
    expect(price.replace(/\D/g, "")).toBe("123450");
  });

  it("leaves the symbol alone in a left-to-right language", () => {
    auth.language = "en";

    expect(createStore("USD").formatAiModelsCurrency(2)).toBe("$2.00");
  });
});
