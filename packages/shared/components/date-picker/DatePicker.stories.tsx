// (c) Copyright Ascensio System SIA 2009-2026
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

import React, { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react";
import type { DateTime } from "luxon";

import { DatePicker } from "./DatePicker";
import { DatePickerProps } from "./DatePicker.types";
import {
  now,
  addToDate,
  startOf,
  createDateTime,
  parseToDateTime,
  formatDate,
} from "../../utils/date";

export default {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          "A customizable date picker component that allows users to select dates with various configuration options.",
      },
    },
  },
  argTypes: {
    initialDate: {
      control: "date",
      description: "Initial selected date value in the picker",
    },
    maxDate: {
      control: "date",
      description: "Maximum selectable date",
    },
    minDate: {
      control: "date",
      description: "Minimum selectable date",
    },
    openDate: {
      control: "date",
      description: "Date to display when the calendar initially opens",
    },
    locale: {
      control: "text",
      description:
        "Locale for date formatting and calendar display (e.g., 'en', 'ru')",
    },
    selectDateText: {
      control: "text",
      description: "Placeholder text shown when no date is selected",
    },
    onChange: {
      action: "onChange",
      description:
        "Callback function called when the selected date changes. Receives a Moment object or null",
    },
    showCalendarIcon: {
      control: "boolean",
      description: "Whether to show the calendar icon in the input field",
    },
    className: {
      control: "text",
      description: "Additional CSS class for the date picker container",
    },
  },
} as Meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: "280px", padding: "20px" }}>{children}</div>;
};

const Template: StoryFn<typeof DatePicker> = ({
  initialDate,
  ...rest
}: DatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(
    initialDate ? parseToDateTime(initialDate) : null,
  );

  return (
    <Wrapper>
      <DatePicker
        {...rest}
        initialDate={initialDate}
        onChange={(date) => {
          rest.onChange?.(date);
          setSelectedDate(date);
        }}
        outerDate={selectedDate}
      />
    </Wrapper>
  );
};

export const Default = Template.bind({});
Default.args = {
  maxDate: startOf(addToDate(now(), 10, "years")!, "year")!,
  minDate: createDateTime(1970, 1, 1),
  openDate: now(),
  locale: "en",
  selectDateText: "Select date",
  onChange: (date) =>
    console.log(
      "Selected date:",
      date ? formatDate(date, "dd MMM yyyy") : "No date",
    ),
};

export const WithInitialDate = Template.bind({});
WithInitialDate.args = {
  ...Default.args,
  initialDate: now(),
  selectDateText: "Date with initial value",
};

export const WithCustomOpenDate = Template.bind({});
WithCustomOpenDate.args = {
  ...Default.args,
  openDate: addToDate(now(), 1, "months")!,
  selectDateText: "Date with custom open date",
};

export const WithFutureOnlyDates = Template.bind({});
WithFutureOnlyDates.args = {
  ...Default.args,
  minDate: startOf(now(), "day")!,
  selectDateText: "Only future dates available",
};

export const WithSpecificYear = Template.bind({});
WithSpecificYear.args = {
  ...Default.args,
  minDate: createDateTime(2023, 1, 1),
  maxDate: createDateTime(2023, 12, 31),
  openDate: createDateTime(2023, 6, 15),
  selectDateText: "Only dates from 2023",
};
