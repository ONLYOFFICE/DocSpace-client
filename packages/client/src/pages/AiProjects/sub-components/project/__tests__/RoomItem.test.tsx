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

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@onlyoffice/apps-ui-kit/components/room-icon", () => ({
  RoomIcon: ({ title }: { title: string }) => <span data-testid="room-logo">{title}</span>,
}));

import RoomItem, { SourceRoomLogo } from "../RoomItem";

const logo = { color: "#FF6680", medium: "/logo.png", cover: null } as never;

describe("SourceRoomLogo", () => {
  it("draws a linked skill set with the skill set icon, not the logo stored for it", () => {
    render(<SourceRoomLogo title="Legal" logo={logo} icon="instructionsRoom.svg" size="20px" />);
    const icon = screen.getByTestId("skill-icon-set");
    expect(icon.style.width).toBe("20px");
    expect(screen.queryByTestId("room-logo")).toBeNull();
  });

  it("draws a linked knowledge base with the knowledge base icon, not the logo stored for it", () => {
    render(<SourceRoomLogo title="Wiki" logo={logo} icon="knowledgeRoom.svg" />);
    expect(screen.getByTestId("skill-icon-knowledge").style.width).toBe("24px");
    expect(screen.queryByTestId("room-logo")).toBeNull();
  });

  it("keeps a folder's own logo", () => {
    render(<SourceRoomLogo title="Reports" logo={logo} icon="folder.svg" />);
    expect(screen.getByTestId("room-logo").textContent).toBe("Reports");
    expect(screen.queryByTestId("skill-icon-set")).toBeNull();
  });
});

describe("RoomItem", () => {
  it("draws the rows of the agent's Context with the skill set and knowledge base icons", () => {
    render(
      <>
        <RoomItem id={1} title="Legal" logo={logo} icon="instructionsRoom.svg" />
        <RoomItem id={2} title="Wiki" logo={logo} icon="knowledgeRoom.svg" />
      </>,
    );
    expect(screen.getByTestId("ai-project-room-1").querySelector("[data-testid='skill-icon-set']")).toBeTruthy();
    expect(
      screen.getByTestId("ai-project-room-2").querySelector("[data-testid='skill-icon-knowledge']"),
    ).toBeTruthy();
  });
});
