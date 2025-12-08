// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Row } from ".";
import styles from "./Row.module.scss";

const baseProps = {
  checked: false,
  element: <span>1</span>,
  contextOptions: [{ key: "1", label: "test" }],
  children: <span>Some text</span>,
  onChangeIndex: () => () => {},
};

describe("<Row />", () => {
  it("renders without error", () => {
    render(
      <Row {...baseProps} isIndexEditingMode={false} onRowClick={() => {}} />,
    );

    expect(screen.getByTestId("row")).toBeInTheDocument();
  });

  it("renders checkbox with correct styling", () => {
    render(
      <Row
        {...baseProps}
        isIndexEditingMode={false}
        onRowClick={() => {}}
        mode="modern"
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.parentElement).toHaveClass("checkbox");
  });

  it("handles checkbox state changes", () => {
    const onSelect = vi.fn();
    render(
      <Row
        {...baseProps}
        onSelect={onSelect}
        isIndexEditingMode={false}
        onRowClick={() => {}}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalled();
  });

  it("shows checkbox when row is checked", () => {
    render(
      <Row
        {...baseProps}
        checked
        isIndexEditingMode={false}
        onRowClick={() => {}}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeVisible();
    expect(checkbox).toBeChecked();
  });

  it("applies modern styling class", () => {
    render(
      <Row
        {...baseProps}
        isIndexEditingMode={false}
        onRowClick={() => {}}
        mode="modern"
      />,
    );

    const row = screen.getByTestId("row");
    expect(row).toHaveClass(styles.modern);
  });

  it("handles indeterminate checkbox state", () => {
    render(
      <Row
        {...baseProps}
        indeterminate
        isIndexEditingMode={false}
        onRowClick={() => {}}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveProperty("indeterminate", true);
  });

  it("renders children content", () => {
    render(
      <Row {...baseProps} isIndexEditingMode={false} onRowClick={() => {}} />,
    );

    expect(screen.getByText("Some text")).toBeInTheDocument();
  });

  it("handles row click events", () => {
    const onRowClick = vi.fn();
    render(
      <Row {...baseProps} isIndexEditingMode={false} onRowClick={onRowClick} />,
    );

    const content = screen.getByText("Some text").closest(".row_content");
    expect(content).not.toBeNull();
    if (content) {
      fireEvent.click(content);
      expect(onRowClick).toHaveBeenCalled();
    }
  });
});
