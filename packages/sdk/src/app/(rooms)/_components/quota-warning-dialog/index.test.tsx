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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const quota = vi.hoisted(() => ({
  isGracePeriod: false,
  dueDate: null,
  delayDueDate: null,
  isRoomsTariffLimit: true,
  maxCountRoomsByQuota: 12,
  usedRoomsCount: 11,
}));

vi.mock("@/app/(docspace)/_store/DialogsStore", () => ({
  useDialogsStore: () => ({ isDialogOpen: () => true, closeDialog: vi.fn() }),
}));
vi.mock("../../_store/RoomsQuotaStore", () => ({
  useRoomsQuotaStore: () => quota,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    ModalDialog: Object.assign(Slot, { Header: Slot, Body: Slot, Footer: Slot }),
    ModalDialogType: { modal: "modal" },
  };
});

import commonEn from "PUBLIC_DIR/locales/en/Common.json";

import QuotaWarningDialog from ".";

const common = commonEn as Record<string, string>;

const MOVED_KEYS = [
  "LicenseExpiredRestriction",
  "PlanPaymentOverdue",
  "GracePeriodActive",
  "LicenseGracePeriodInfo",
  "ChooseNewPlan",
  "CannotCreateNewRoom",
  "NewRoomWillExceedLimit",
  "RoomsQuotaAlmostExhausted",
  "NumberOfRoomsAccordingToTariff",
  "ContactToUpgradeTariff",
];

describe("QuotaWarningDialog", () => {
  const i18n = i18next.createInstance();
  let root: Root | null = null;

  beforeAll(async () => {
    await i18n.init({
      lng: "en",
      ns: ["Common"],
      defaultNS: "Common",
      resources: { en: { Common: common } },
      interpolation: { escapeValue: false },
    });
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const render = () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <I18nextProvider i18n={i18n}>
          <QuotaWarningDialog
            isPaymentPageAvailable={false}
            standalone={false}
            language="en"
          />
        </I18nextProvider>,
      ),
    );
    return container.textContent ?? "";
  };

  const rawKeys = (text: string) => MOVED_KEYS.filter((key) => text.includes(key));

  it("Room limit reached", () => {
    quota.isRoomsTariffLimit = true;

    const text = render();

    expect(text).toContain(common.CannotCreateNewRoom);
    expect(text).toContain(common.NewRoomWillExceedLimit);
    expect(text).toContain(common.ContactToUpgradeTariff);
    expect(rawKeys(text)).toEqual([]);
  });

  it("Room limit nearly reached", () => {
    quota.isRoomsTariffLimit = false;

    const text = render();

    expect(text).toContain(common.RoomsQuotaAlmostExhausted);
    expect(text).toContain("11/12");
    expect(rawKeys(text)).toEqual([]);
  });
});
