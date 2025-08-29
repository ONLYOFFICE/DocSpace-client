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
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TimePicker } from ".";

describe("<TimePicker />", () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  const baseProps = {
    initialTime: "2025-01-09T14:30:00",
    onChange: mockOnChange,
    onBlur: mockOnBlur,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    const { container } = render(<TimePicker {...baseProps} />);
    expect(container).toBeTruthy();
  });

  it("renders with correct initial time", () => {
    render(<TimePicker {...baseProps} />);
    const hoursInput = screen.getByLabelText("Hours") as HTMLInputElement;
    const minutesInput = screen.getByLabelText("Minutes") as HTMLInputElement;

    expect(hoursInput.value).toBe("14");
    expect(minutesInput.value).toBe("30");
  });

  it("handles hours input correctly", () => {
    render(<TimePicker {...baseProps} />);
    const hoursInput = screen.getByLabelText("Hours") as HTMLInputElement;

    fireEvent.change(hoursInput, { target: { value: "15" } });
    expect(hoursInput.value).toBe("15");
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("handles minutes input correctly", () => {
    render(<TimePicker {...baseProps} />);
    const minutesInput = screen.getByLabelText("Minutes") as HTMLInputElement;

    fireEvent.change(minutesInput, { target: { value: "45" } });
    expect(minutesInput.value).toBe("45");
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("validates hours input range", () => {
    render(<TimePicker {...baseProps} />);
    const hoursInput = screen.getByLabelText("Hours") as HTMLInputElement;

    fireEvent.change(hoursInput, { target: { value: "24" } });
    expect(hoursInput.value).toBe("02");
  });

  it("handles blur events", () => {
    render(<TimePicker {...baseProps} />);
    const minutesInput = screen.getByLabelText("Minutes");
    fireEvent.focus(minutesInput);
    fireEvent.change(minutesInput, { target: { value: "59" } });
    fireEvent.blur(minutesInput);

    expect(mockOnBlur).toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(<TimePicker {...baseProps} />);
    const timePicker = screen.getByRole("group");
    expect(timePicker).toHaveAttribute("aria-label", "Time picker");
    const hoursInput = screen.getByLabelText("Hours");
    expect(hoursInput).toHaveAttribute("data-test-id", "hours-input");
    const minutesInput = screen.getByLabelText("Minutes");
    expect(minutesInput).toHaveAttribute("data-test-id", "minutes-input");
  });
});
