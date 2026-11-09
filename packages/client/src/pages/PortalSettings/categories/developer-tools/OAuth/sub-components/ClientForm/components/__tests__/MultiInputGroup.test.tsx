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

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MultiInputGroup from "../MultiInputGroup";

const URL_VALUE = "https://example.com/callback";

const renderGroup = () => {
  const onAdd = vi.fn();
  render(
    <MultiInputGroup
      t={(key: string) => key}
      label="Redirect URIs"
      name="redirect_uris"
      placeholder="URL"
      currentValue={[]}
      onAdd={onAdd}
      dataTestId="redirect"
    />,
  );
  return { onAdd, input: screen.getByTestId("redirect_input") };
};

describe("MultiInputGroup", () => {
  // The add block hides once it adds the value: the focus it held fell to
  // the page's body, and every further URI started from the top of the page.
  it("gives the focus back to the field after adding from the keyboard", () => {
    const { onAdd, input } = renderGroup();
    act(() => input.focus());
    fireEvent.change(input, { target: { value: URL_VALUE } });

    const add = screen
      .getByText("Common:AddButton")
      .closest<HTMLElement>('[role="button"]')!;
    act(() => add.focus());
    fireEvent.keyDown(add, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("redirect_uris", URL_VALUE);
    expect(input).toHaveFocus();
    // Taking the focus back must not bring the add block back for the value
    // just added.
    expect(input).toHaveValue("");
    expect(add).not.toBeVisible();
  });
});
