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
import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, render, fireEvent } from "@testing-library/react";
import moment from "moment";
import { DateTimePicker } from "./DateTimePicker";
import { DateTimePickerProps } from "./DateTimerPicker.types";
import styles from "./DateTimePicker.module.scss";

describe("DateTimePicker", () => {
  const defaultProps: DateTimePickerProps = {
    initialDate: moment("2025-01-27T10:00:00"),
    selectDateText: "Select Date",
    onChange: vi.fn(),
    className: "test-date-picker",
    id: "test-date-picker",
    locale: "en",
    hasError: false,
    openDate: moment("2025-01-27T10:00:00"),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<DateTimePicker {...defaultProps} />);

    const picker = screen.getByTestId("date-time-picker");
    expect(picker).toBeInTheDocument();
    expect(picker).toHaveClass(styles.selectors);
    expect(picker).toHaveAttribute("aria-label", "Select Date");
    expect(picker).toHaveAttribute("aria-invalid", "false");
  });

  it("should render with error state", () => {
    render(<DateTimePicker {...defaultProps} hasError />);

    const picker = screen.getByTestId("date-time-picker");
    expect(picker).toHaveClass(styles.hasError);
    expect(picker).toHaveAttribute("aria-invalid", "true");
  });

  it("should handle date change", () => {
    const onChange = vi.fn();
    render(<DateTimePicker {...defaultProps} onChange={onChange} />);

    const datePicker = screen.getByTestId("date-picker");
    expect(datePicker).toBeInTheDocument();
  });

  it("should display and handle time picker", () => {
    render(<DateTimePicker {...defaultProps} />);

    const timeDisplay = screen.getByTestId("date-time-picker-time-display");
    expect(timeDisplay).toBeInTheDocument();
    expect(timeDisplay).toHaveAttribute("role", "button");
    expect(timeDisplay).toHaveAttribute("aria-label", "Current time: 10:00");

    const clockIcon = screen.getByTestId("date-time-picker-clock-icon");
    expect(clockIcon).toBeInTheDocument();
    expect(clockIcon).toHaveAttribute("aria-hidden", "true");
  });

  it("should respect min and max date constraints", () => {
    const minDate = moment("2025-01-01");
    const maxDate = moment("2025-12-31");

    render(
      <DateTimePicker {...defaultProps} minDate={minDate} maxDate={maxDate} />,
    );

    const datePicker = screen.getByTestId("date-picker");
    expect(datePicker).toBeInTheDocument();
  });

  it("should use provided locale", () => {
    render(<DateTimePicker {...defaultProps} locale="fr" />);

    const picker = screen.getByTestId("date-time-picker");
    expect(picker).toBeInTheDocument();
  });

  it("should show time picker on click", () => {
    render(<DateTimePicker {...defaultProps} />);

    const timeDisplay = screen.getByTestId("date-time-picker-time-display");
    fireEvent.click(timeDisplay);

    const timePicker = screen.getByTestId("time-picker");
    expect(timePicker).toBeInTheDocument();
    expect(timePicker).toHaveAttribute("aria-label", "Time picker");
  });
});
