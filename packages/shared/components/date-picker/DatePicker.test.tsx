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
import moment from "moment";
import { describe, it, expect, vi } from "vitest";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./DatePicker";

// Mock selector-add-button
vi.mock("../selector-add-button", () => ({
  SelectorAddButton: ({
    children,
    // ...props
  }: {
    children: React.ReactNode;
  }) => <div data-testid="mock-selector-add-button">{children}</div>,
}));

describe("DatePicker tests", () => {
  const defaultProps = {
    maxDate: moment().add(10, "years").startOf("year").toDate(),
    minDate: moment("1970-01-01").toDate(),
    openDate: moment(),
    locale: "en",
    selectDateText: "Select date",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without selected date", () => {
    render(<DatePicker {...defaultProps} />);

    const datePicker = screen.getByTestId("date-picker");
    const dateSelector = screen.getByTestId("date-selector");

    expect(datePicker).toBeInTheDocument();
    expect(dateSelector).toHaveAttribute("role", "button");
    expect(dateSelector).toHaveAttribute("aria-label", "Select date");
    expect(dateSelector).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("selected-item")).not.toBeInTheDocument();
  });

  it("renders with initial date", () => {
    const initialDate = moment("2024-01-15");
    render(
      <DatePicker
        initialDate={initialDate}
        outerDate={initialDate}
        showCalendarIcon={false}
        {...defaultProps}
      />,
    );

    const selectedItem = screen.getByTestId("selected-item");
    expect(selectedItem).toBeInTheDocument();
    expect(selectedItem).toHaveTextContent("15 Jan 2024");
  });

  it("shows calendar icon when enabled", () => {
    const initialDate = moment("2024-01-15");
    render(
      <DatePicker
        initialDate={initialDate}
        outerDate={initialDate}
        showCalendarIcon
        {...defaultProps}
      />,
    );

    const calendarIcon = screen.getByTestId("calendar-icon");
    const selectedLabel = screen.getByTestId("selected-label");

    expect(calendarIcon).toBeInTheDocument();
    expect(selectedLabel).toContainElement(calendarIcon);
  });

  it("opens calendar on click and handles date selection", async () => {
    const onChange = vi.fn();
    render(<DatePicker {...defaultProps} onChange={onChange} />);

    const dateSelector = screen.getByTestId("date-selector");
    expect(dateSelector).toHaveAttribute("aria-expanded", "false");

    // Open calendar
    await userEvent.click(dateSelector);

    // Check if calendar is open
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
    expect(dateSelector).toHaveAttribute("aria-expanded", "true");

    // Close by clicking outside
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByTestId("calendar")).not.toBeInTheDocument();
      expect(dateSelector).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("handles date deletion", async () => {
    const onChange = vi.fn();
    const initialDate = moment("2024-01-15");
    const { rerender } = render(
      <DatePicker
        {...defaultProps}
        initialDate={initialDate}
        outerDate={initialDate}
        onChange={onChange}
      />,
    );

    const selectedItem = screen.getByTestId("selected-item");
    const closeButton = selectedItem.querySelector(".selected-tag-removed");
    expect(closeButton).toBeInTheDocument();

    await userEvent.click(closeButton!);

    expect(onChange).toHaveBeenCalledWith(null);

    rerender(
      <DatePicker
        {...defaultProps}
        initialDate={initialDate}
        onChange={onChange}
      />,
    );

    expect(screen.queryByTestId("selected-item")).not.toBeInTheDocument();
    expect(screen.getByTestId("date-selector")).toBeInTheDocument();
  });

  it("updates date when outerDate prop changes", async () => {
    const initialDate = moment("2024-01-15");
    const { rerender } = render(
      <DatePicker
        {...defaultProps}
        initialDate={initialDate}
        outerDate={initialDate}
        showCalendarIcon={false}
      />,
    );

    expect(screen.getByTestId("selected-item")).toHaveTextContent(
      "15 Jan 2024",
    );

    const newInitialDate = moment("2024-02-01");

    rerender(
      <DatePicker
        {...defaultProps}
        initialDate={newInitialDate}
        outerDate={newInitialDate}
        showCalendarIcon={false}
      />,
    );

    await waitFor(() => {
      const selectedItem = screen.getByTestId("selected-item");
      expect(selectedItem).toHaveTextContent("01 Feb 2024");
    });
  });

  it("applies custom className and id", () => {
    const customClass = "custom-date-picker";
    const customId = "custom-date-picker-id";

    render(
      <DatePicker {...defaultProps} className={customClass} id={customId} />,
    );

    const datePicker = screen.getByTestId("date-picker");
    expect(datePicker).toHaveClass(customClass);
    expect(datePicker).toHaveAttribute("id", customId);
  });
});
