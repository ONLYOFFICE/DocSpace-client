// (c) Copyright Ascensio System SIA 2009-2024
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
import moment from "moment";

import { DatePicker } from "./DatePicker";
import { DatePickerProps } from "./DatePicker.types";

export default {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component: "DatePicker component",
      },
    },
  },
} as Meta;

const Template: StoryFn<typeof DatePicker> = ({
  initialDate,
  ...rest
}: DatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(
    initialDate ? moment(initialDate) : null,
  );

  return (
    <DatePicker
      {...rest}
      initialDate={initialDate}
      onChange={(date) => {
        rest.onChange?.(date);
        setSelectedDate(date);
      }}
      outerDate={selectedDate}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  maxDate: moment().add(10, "years").startOf("year"),
  minDate: moment("1970-01-01"),
  openDate: moment(),
  locale: "en",
  selectDateText: "Select date",
  onChange: (date) =>
    console.log("Selected date:", date?.format("DD MMM YYYY") ?? "No date"),
};

export const WithInitialDate = Template.bind({});
WithInitialDate.args = {
  ...Default.args,
  initialDate: moment(),
  selectDateText: "Date with initial value",
};

export const WithCalendarIcon = Template.bind({});
WithCalendarIcon.args = {
  ...Default.args,
  initialDate: moment(),
  showCalendarIcon: true,
  selectDateText: "Date with calendar icon",
};

export const WithCustomOpenDate = Template.bind({});
WithCustomOpenDate.args = {
  ...Default.args,
  openDate: moment().add(1, "month"),
  selectDateText: "Date with custom open date",
};

export const WithDateRange = Template.bind({});
WithDateRange.args = {
  ...Default.args,
  minDate: moment().subtract(1, "month"),
  maxDate: moment().add(1, "month"),
  selectDateText: "Date with range constraints",
};
