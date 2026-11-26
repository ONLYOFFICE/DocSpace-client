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

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TMemberPlugin } from "@docspace/shared/api/plugins/types";

vi.mock("@onlyoffice/apps-ui-kit/components/table", () => ({
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TableCell: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/tooltip", () => ({
  Tooltip: ({
    isOpen,
    getContent,
  }: {
    isOpen?: boolean;
    getContent: () => React.ReactNode;
  }) => (isOpen ? <div data-testid="description-tooltip">{getContent()}</div> : null),
}));

const TableRow = (await import("../TableRow")).default;

const plugin = {
  name: "weather-now",
  pluginName: "WeatherNow",
  version: "1.0.0",
  enabled: true,
  description: "Shows the weather",
  cspDomains: "",
  createOn: "2026-11-24T10:12:00Z",
  createBy: { id: "u1", displayName: "Anna", avatarSmall: "" },
  createByType: "User",
  createByIsOwner: false,
} as unknown as TMemberPlugin;

describe("TableRow", () => {
  it("shows the description while the plugin name has keyboard focus", () => {
    render(
      <TableRow
        plugin={plugin}
        language="en"
        isMe={false}
        hideColumns={false}
        hiddenColumns={[]}
        isSwitching={() => false}
        onSwitch={vi.fn(async () => {})}
        onDelete={vi.fn()}
      />,
    );

    const title = screen.getByTestId("plugin_title_u1_weather-now");

    expect(screen.queryByTestId("description-tooltip")).toBeNull();

    fireEvent.focus(title);
    expect(screen.getByTestId("description-tooltip")).toHaveTextContent(
      "Shows the weather",
    );

    fireEvent.blur(title);
    expect(screen.queryByTestId("description-tooltip")).toBeNull();
  });
});
