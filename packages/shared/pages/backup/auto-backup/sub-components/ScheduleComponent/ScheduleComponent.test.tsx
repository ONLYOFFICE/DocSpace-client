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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AutoBackupPeriod } from "../../../../../enums";
import type { TOption } from "../../../../../components/combobox";

import ScheduleComponent from "./ScheduleComponent";

jest.mock("@docspace/shared/components/help-button", () => ({
  HelpButton: ({ className }: { className: string }) => (
    <div className={className} data-testid="help-button">
      Help Button
    </div>
  ),
}));

jest.mock("@docspace/shared/components/combobox", () => ({
  ComboBox: ({
    options,
    selectedOption,
    onSelect,
    isDisabled,
    className,
  }: {
    options: TOption[];
    selectedOption: { key: number; label: string };
    onSelect: (option: TOption) => void;
    isDisabled: boolean;
    className: string;
  }) => (
    <div
      className={className}
      data-testid="combobox"
      data-disabled={isDisabled}
      data-selected={selectedOption.label}
      onClick={() => !isDisabled && options.length > 0 && onSelect(options[0])}
    >
      {selectedOption.label}
    </div>
  ),
}));

const defaultProps = {
  selectedPeriodLabel: "Every day",
  selectedWeekdayLabel: "Monday",
  selectedHour: "12:00",
  selectedMonthDay: "1",
  selectedMaxCopiesNumber: "3",
  selectedPeriodNumber: AutoBackupPeriod.EveryDayType.toString(),
  isLoadingData: false,
  periodsObject: [
    { key: AutoBackupPeriod.EveryDayType, label: "Every day" },
    { key: AutoBackupPeriod.EveryWeekType, label: "Every week" },
    { key: AutoBackupPeriod.EveryMonthType, label: "Every month" },
  ],
  weekdaysLabelArray: [
    { key: 0, label: "Monday" },
    { key: 1, label: "Tuesday" },
  ],
  monthNumbersArray: Array(31)
    .fill(null)
    .map((_, index) => ({
      key: index + 1,
      label: `${index + 1}`,
    })),
  hoursArray: Array(24)
    .fill(null)
    .map((_, index) => ({
      key: index,
      label: `${index}:00`,
    })),
  maxNumberCopiesArray: [
    { key: 1, label: "Max 1 copy" },
    { key: 3, label: "Max 3 copies" },
  ],
  setMaxCopies: jest.fn(),
  setPeriod: jest.fn(),
  setWeekday: jest.fn(),
  setMonthNumber: jest.fn(),
  setTime: jest.fn(),
};

describe("ScheduleComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<ScheduleComponent {...defaultProps} />);
    expect(screen.getByTestId("schedule-component")).toBeInTheDocument();
  });

  it("renders correctly with weekly schedule", () => {
    render(
      <ScheduleComponent
        {...defaultProps}
        selectedPeriodNumber={AutoBackupPeriod.EveryWeekType.toString()}
        selectedPeriodLabel="Every week"
      />,
    );
    const comboboxes = screen.getAllByTestId("combobox");
    expect(comboboxes.length).toBe(4);
    expect(comboboxes[0]).toHaveTextContent("Every week");
    expect(comboboxes[1]).toHaveTextContent("Monday");
  });

  it("renders correctly with monthly schedule", () => {
    render(
      <ScheduleComponent
        {...defaultProps}
        selectedPeriodNumber={AutoBackupPeriod.EveryMonthType.toString()}
        selectedPeriodLabel="Every month"
      />,
    );
    const comboboxes = screen.getAllByTestId("combobox");
    expect(comboboxes.length).toBe(4);
    expect(comboboxes[0]).toHaveTextContent("Every month");
    expect(comboboxes[1]).toHaveTextContent("1");
  });

  it("disables all inputs when isLoadingData is true", () => {
    render(<ScheduleComponent {...defaultProps} isLoadingData />);
    const comboboxes = screen.getAllByTestId("combobox");
    comboboxes.forEach((combobox) => {
      expect(combobox).toHaveAttribute("data-disabled", "true");
    });
  });

  it("calls setPeriod when period combobox is clicked", () => {
    render(<ScheduleComponent {...defaultProps} />);
    const periodCombobox = screen.getAllByTestId("combobox")[0];
    fireEvent.click(periodCombobox);
    expect(defaultProps.setPeriod).toHaveBeenCalledTimes(1);
    expect(defaultProps.setPeriod).toHaveBeenCalledWith(
      defaultProps.periodsObject[0],
    );
  });

  it("calls setTime when time combobox is clicked", () => {
    render(<ScheduleComponent {...defaultProps} />);
    const timeCombobox = screen.getAllByTestId("combobox")[1];
    fireEvent.click(timeCombobox);
    expect(defaultProps.setTime).toHaveBeenCalledTimes(1);
    expect(defaultProps.setTime).toHaveBeenCalledWith(
      defaultProps.hoursArray[0],
    );
  });

  it("calls setMaxCopies when max copies combobox is clicked", () => {
    render(<ScheduleComponent {...defaultProps} />);
    const maxCopiesCombobox = screen.getAllByTestId("combobox")[2];
    fireEvent.click(maxCopiesCombobox);
    expect(defaultProps.setMaxCopies).toHaveBeenCalledTimes(1);
    expect(defaultProps.setMaxCopies).toHaveBeenCalledWith(
      defaultProps.maxNumberCopiesArray[0],
    );
  });

  it("calls setWeekday when weekday combobox is clicked in weekly mode", () => {
    render(
      <ScheduleComponent
        {...defaultProps}
        selectedPeriodNumber={AutoBackupPeriod.EveryWeekType.toString()}
        selectedPeriodLabel="Every week"
      />,
    );
    const weekdayCombobox = screen.getAllByTestId("combobox")[1];
    fireEvent.click(weekdayCombobox);
    expect(defaultProps.setWeekday).toHaveBeenCalledTimes(1);
    expect(defaultProps.setWeekday).toHaveBeenCalledWith(
      defaultProps.weekdaysLabelArray[0],
    );
  });

  it("calls setMonthNumber when month day combobox is clicked in monthly mode", () => {
    render(
      <ScheduleComponent
        {...defaultProps}
        selectedPeriodNumber={AutoBackupPeriod.EveryMonthType.toString()}
        selectedPeriodLabel="Every month"
      />,
    );
    const monthDayCombobox = screen.getAllByTestId("combobox")[1];
    fireEvent.click(monthDayCombobox);
    expect(defaultProps.setMonthNumber).toHaveBeenCalledTimes(1);
    expect(defaultProps.setMonthNumber).toHaveBeenCalledWith(
      defaultProps.monthNumbersArray[0],
    );
  });
});
