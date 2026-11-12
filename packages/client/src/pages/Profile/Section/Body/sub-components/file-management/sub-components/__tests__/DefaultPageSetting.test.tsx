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

import type React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

import { EmployeeType, FolderType } from "@docspace/shared/enums";

type TOption = { key: number; label: string };

vi.mock("@onlyoffice/apps-ui-kit/components/combobox", () => ({
  ComboBox: ({
    options,
    selectedOption,
    onSelect,
  }: {
    options: TOption[];
    selectedOption: TOption;
    onSelect: (option: TOption) => void;
  }) => (
    <ul data-selected={selectedOption.key}>
      {options.map((option) => (
        <li key={option.key}>
          <button type="button" onClick={() => onSelect(option)}>
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  ),
}));

import { DefaultPageSetting } from "../DefaultPageSetting";

const Setting = DefaultPageSetting as unknown as React.ComponentType;

const renderSetting = (isPrivateRoomsSectionAvailable: boolean) => {
  const updateDefaultFolderType = vi.fn(async () => {});
  render(
    <Provider
      settingsStore={{
        defaultFolderType: FolderType.DEFAULT,
        updateDefaultFolderType,
        aiServicesEnabled: true,
      }}
      userStore={{ userType: EmployeeType.Admin }}
      appsStore={{ isPrivateRoomsSectionAvailable }}
    >
      <Setting />
    </Provider>,
  );
  return updateDefaultFolderType;
};

const options = () =>
  screen.getAllByRole("button").map((button) => button.textContent);

describe("DefaultPageSetting — Section is a start page option while available", () => {
  it("Default page setting", () => {
    const updateDefaultFolderType = renderSetting(true);

    expect(options()).toEqual([
      "Common:Home",
      "Common:Files",
      "Common:Rooms",
      "Common:Forms",
      "Common:Private",
      "Common:AiWorkspace",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Common:Private" }));

    expect(updateDefaultFolderType).toHaveBeenCalledWith(
      FolderType.PrivateRooms,
    );
  });

  it("Section not available", () => {
    renderSetting(false);

    expect(options()).not.toContain("Common:Private");
  });
});
