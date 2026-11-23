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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  identity: {
    userKeys: null as null | { userId: string },
    ownerId: undefined as string | undefined,
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => env.identity,
}));

import DisclosureBanner from "./DisclosureBanner";

const banner = (container: HTMLElement) =>
  container.querySelector('[data-test-id="private-disclosure-banner"]');
const dismissButton = (container: HTMLElement) =>
  container.querySelector<HTMLButtonElement>(
    '[data-test-id="private-disclosure-dismiss"]',
  );

describe("Shell side effects: banner shown once", () => {
  let root: Root | null = null;
  let container: HTMLElement;

  const render = () => {
    container = document.createElement("div");
    root = createRoot(container);
    act(() => root?.render(<DisclosureBanner />));
  };

  const unmount = () => {
    act(() => root?.unmount());
    root = null;
  };

  beforeEach(() => {
    localStorage.clear();
    env.identity.userKeys = { userId: "user-1" };
    env.identity.ownerId = undefined;
  });

  afterEach(() => {
    unmount();
    vi.restoreAllMocks();
  });

  it("shows the banner to a user who has not dismissed it", () => {
    render();

    expect(banner(container)).not.toBeNull();
  });

  it("takes the user from the owner id when no key is loaded", () => {
    env.identity.userKeys = null;
    env.identity.ownerId = "owner-1";
    render();
    act(() => dismissButton(container)?.click());

    expect(localStorage.getItem("private-disclosure-dismissed:owner-1")).toBe(
      "1",
    );
  });

  it("renders nothing without a user", () => {
    env.identity.userKeys = null;
    render();

    expect(banner(container)).toBeNull();
  });

  it("stays dismissed for that user and shows for another one", () => {
    render();
    act(() => dismissButton(container)?.click());
    expect(banner(container)).toBeNull();
    expect(localStorage.getItem("private-disclosure-dismissed:user-1")).toBe(
      "1",
    );
    unmount();

    render();
    expect(banner(container)).toBeNull();
    unmount();

    env.identity.userKeys = { userId: "user-2" };
    render();
    expect(banner(container)).not.toBeNull();
  });

  it("shows the banner when the storage cannot be read", () => {
    localStorage.setItem("private-disclosure-dismissed:user-1", "1");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    render();

    expect(banner(container)).not.toBeNull();
  });

  it("hides the banner for the session when the storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    render();

    expect(() =>
      act(() => dismissButton(container)?.click()),
    ).not.toThrow();
    expect(banner(container)).toBeNull();
  });
});
