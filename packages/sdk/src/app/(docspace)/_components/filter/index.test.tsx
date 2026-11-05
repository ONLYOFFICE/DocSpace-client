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
  searchParams: new URLSearchParams(),
  props: null as Record<string, unknown> | null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => env.searchParams,
  usePathname: () => "/private/10",
}));

vi.mock("@docspace/shared/utils/common", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  frameCallEvent: vi.fn(),
}));

vi.mock("@docspace/shared/utils/renderFilterSelector", () => ({
  default: () => null,
}));

vi.mock("@/app/(docspace)/_store/SettingsStore", () => ({
  useSettingsStore: () => ({ filesViewAs: "row", setFilesViewAs: vi.fn() }),
}));

vi.mock("@/hooks/useDeviceType", () => ({
  default: () => ({ currentDeviceType: "desktop" }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/filter", () => ({
  default: (props: Record<string, unknown>) => {
    env.props = props;
    return null;
  },
}));

import { Filter } from ".";

const ADDRESS = "?folder=10&sortby=DateAndTime&search=salaries";

describe("Filter", () => {
  let root: Root | null = null;

  const render = (hideSearch?: boolean) => {
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <Filter
          filesFilter={ADDRESS.slice(1)}
          currentFolderId={10}
          hideSearch={hideSearch}
        />,
      ),
    );
    return env.props as {
      hideSearch?: boolean;
      initSearchValue: string;
      getSelectedInputValue: () => string;
      onSort: (sortId: string, sortDirection: string) => void;
    };
  };

  beforeEach(() => {
    window.history.replaceState(null, "", `/private/10${ADDRESS}`);
    env.searchParams = new URLSearchParams(ADDRESS);
    env.props = null;
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Private room opened: no search field, and no search text carried on", () => {
    const props = render(true);

    expect(props.hideSearch).toBe(true);
    expect(props.initSearchValue).toBe("");
    expect(props.getSelectedInputValue()).toBe("");

    act(() => props.onSort("Size", "desc"));

    const address = new URLSearchParams(window.location.search);
    expect(address.get("sortby")).toBe("Size");
    expect(address.has("search")).toBe(false);
  });

  it("keeps the search text of a listing that is searched", () => {
    const props = render();

    expect(props.hideSearch).toBeUndefined();
    expect(props.initSearchValue).toBe("salaries");
  });
});
