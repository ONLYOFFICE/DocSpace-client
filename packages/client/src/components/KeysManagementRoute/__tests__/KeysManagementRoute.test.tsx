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

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("react-router", () => ({
  Navigate: ({ to, relative }: { to: string; relative?: string }) => (
    <div data-testid="redirect" data-to={to} data-relative={relative} />
  ),
}));

const { default: KeysManagementRoute } = await import("../index");

type Props = React.ComponentProps<typeof KeysManagementRoute>;

const KEY = { id: "key-1" };

const renderRoute = (props: Partial<Props> = {}) =>
  render(
    <KeysManagementRoute
      isSectionAvailable
      isFrameOptInSettled
      isAppsLoaded
      isAppsLoadFailed={false}
      ensureAppsLoaded={vi.fn()}
      canManageApps
      encryptionKeys={[]}
      getEncryptionKeys={vi.fn(async () => [])}
      {...(props as object)}
    >
      <div data-testid="keys-management" />
    </KeysManagementRoute>,
  );

const expectProfileFallback = () => {
  const redirect = screen.getByTestId("redirect");
  expect(redirect).toHaveAttribute("data-to", "../login");
  expect(redirect).toHaveAttribute("data-relative", "path");
  expect(screen.queryByTestId("keys-management")).toBeNull();
};

describe("KeysManagementRoute", () => {
  it("Section available", () => {
    renderRoute();

    expect(screen.getByTestId("keys-management")).toBeInTheDocument();
  });

  it("App off, no key", () => {
    renderRoute({ isSectionAvailable: false, encryptionKeys: [] });

    expectProfileFallback();
  });

  it("App off, key held", () => {
    renderRoute({ isSectionAvailable: false, encryptionKeys: [KEY] });

    expect(screen.getByTestId("keys-management")).toBeInTheDocument();
  });

  it("reads the keys before deciding when they are not known yet", async () => {
    let finishRead!: () => void;
    const getEncryptionKeys = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRead = resolve;
        }),
    );
    const view = renderRoute({
      isSectionAvailable: false,
      encryptionKeys: null,
      getEncryptionKeys,
    });

    expect(getEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("redirect")).toBeNull();
    expect(screen.queryByTestId("keys-management")).toBeNull();

    // The store gets the key before the read settles.
    view.rerender(
      <KeysManagementRoute
        isSectionAvailable={false}
        isFrameOptInSettled
        isAppsLoaded
        isAppsLoadFailed={false}
        ensureAppsLoaded={vi.fn()}
        canManageApps
        encryptionKeys={[KEY]}
        getEncryptionKeys={getEncryptionKeys}
      >
        <div data-testid="keys-management" />
      </KeysManagementRoute>,
    );
    await act(async () => finishRead());

    expect(screen.getByTestId("keys-management")).toBeInTheDocument();
  });

  it("falls back to the profile when the keys cannot be read", async () => {
    renderRoute({
      isSectionAvailable: false,
      encryptionKeys: null,
      getEncryptionKeys: vi.fn(async () => {
        throw new Error("403");
      }),
    });

    await act(async () => {});

    expectProfileFallback();
  });

  it("waits for the apps list on standalone", () => {
    const getEncryptionKeys = vi.fn(async () => []);
    renderRoute({
      isAppsLoaded: false,
      isSectionAvailable: false,
      encryptionKeys: null,
      getEncryptionKeys,
    });

    expect(screen.queryByTestId("redirect")).toBeNull();
    expect(screen.queryByTestId("keys-management")).toBeNull();
    expect(getEncryptionKeys).not.toHaveBeenCalled();
  });

  it("waits for the frame configuration in an SDK frame", () => {
    renderRoute({ isFrameOptInSettled: false, isSectionAvailable: false });

    expect(screen.queryByTestId("redirect")).toBeNull();
    expect(screen.queryByTestId("keys-management")).toBeNull();
  });
});
