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

import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import UserFields from "../user-fields";

const renderFields = () => {
  const onClickAdd = vi.fn();
  render(
    <UserFields
      buttonLabel="Add"
      inputs={["10.0.0.1"]}
      onChangeInput={vi.fn()}
      onDeleteInput={vi.fn()}
      onClickAdd={onClickAdd}
      validateFunc={() => true}
      addButtonDataTestId="add_button"
    />,
  );
  return { onClickAdd, add: screen.getByText("Add") };
};

describe("UserFields", () => {
  it.each(["Enter", " "])("adds a field on %j pressed on the add link", (key) => {
    const { onClickAdd, add } = renderFields();

    fireEvent.keyDown(add, { key });

    expect(onClickAdd).toHaveBeenCalledOnce();
  });

  it("leaves other keys alone", () => {
    const { onClickAdd, add } = renderFields();

    fireEvent.keyDown(add, { key: "a" });

    expect(onClickAdd).not.toHaveBeenCalled();
  });

  it.each(["Enter", " "])("deletes a field on %j pressed on its delete button", (key) => {
    const onDeleteInput = vi.fn();
    render(
      <UserFields
        buttonLabel="Add"
        inputs={["10.0.0.1"]}
        onChangeInput={vi.fn()}
        onDeleteInput={onDeleteInput}
        onClickAdd={vi.fn()}
        validateFunc={() => true}
      />,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Common:Delete" }), {
      key,
    });

    expect(onDeleteInput).toHaveBeenCalledWith(0);
  });

  const Stateful = ({ initial }: { initial: string[] }) => {
    const [inputs, setInputs] = useState(initial);
    return (
      <UserFields
        buttonLabel="Add"
        inputs={inputs}
        onChangeInput={vi.fn()}
        onDeleteInput={(index: number) =>
          setInputs((list) => list.filter((_, i) => i !== index))
        }
        onClickAdd={vi.fn()}
        validateFunc={() => true}
      />
    );
  };

  it("gives the focus to the delete button that takes the deleted one's place", () => {
    render(<Stateful initial={["10.0.0.1", "10.0.0.2"]} />);
    const [first] = screen.getAllByRole("button", { name: "Common:Delete" });
    first.focus();

    fireEvent.keyDown(first, { key: "Enter" });

    const [left] = screen.getAllByRole("button", { name: "Common:Delete" });
    expect(screen.getAllByRole("button", { name: "Common:Delete" })).toHaveLength(1);
    expect(left).toHaveFocus();
  });

  it("gives the focus to Add once the last field is deleted", () => {
    render(<Stateful initial={["10.0.0.1"]} />);
    const button = screen.getByRole("button", { name: "Common:Delete" });
    button.focus();

    fireEvent.keyDown(button, { key: "Enter" });

    expect(screen.queryByRole("button", { name: "Common:Delete" })).toBeNull();
    expect(screen.getByText("Add")).toHaveFocus();
  });
});
