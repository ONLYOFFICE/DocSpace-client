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

import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import moment from "moment";

import { DateTimePicker } from "./DateTimePicker";
import { DateTimePickerProps } from "./DateTimerPicker.types";

const locales = [
  "az",
  "ar-SA",
  "zh-cn",
  "cs",
  "nl",
  "en-gb",
  "en",
  "fi",
  "fr",
  "de",
  "de-ch",
  "el",
  "it",
  "ja",
  "ko",
  "lv",
  "pl",
  "pt",
  "pt-br",
  "ru",
  "sk",
  "sl",
  "es",
  "tr",
  "uk",
  "vi",
];

const meta = {
  title: "Components/DateTimePicker",
  component: DateTimePicker,
  argTypes: {
    minDate: {
      control: "date",
      description: "Minimum selectable date and time",
    },
    maxDate: {
      control: "date",
      description: "Maximum selectable date and time",
    },
    initialDate: {
      control: "date",
      description: "Initial selected date and time value",
    },
    openDate: {
      control: "date",
      description: "Date to display when the calendar initially opens",
    },
    onChange: {
      action: "onChange",
      description:
        "Callback function called when the selected date/time changes. Receives a Moment object or null",
    },
    locale: {
      control: "select",
      options: locales,
      description:
        "Locale for date and time formatting (affects calendar and time display)",
    },
    hasError: {
      control: "boolean",
      description: "Indicates if the picker is in an error state",
    },
    className: {
      control: "text",
      description: "Additional CSS class for the date-time picker container",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Combined date and time input component that allows users to select both date and time values. Provides calendar for date selection and time input with validation.",
      },
    },
  },
} satisfies Meta<typeof DateTimePicker>;
type Story = StoryObj<typeof DateTimePicker>;

export default meta;

const Template = (args: DateTimePickerProps) => {
  return (
    <div style={{ height: "500px" }}>
      <DateTimePicker {...args} />
    </div>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    locale: "en",
    maxDate: new Date(`${new Date().getFullYear() + 10}/01/01`),
    minDate: new Date("1970/01/01"),
    openDate: moment(),
    selectDateText: "Select date",
    className: "date-time-picker",
    id: "default-date-time-picker",
    hasError: false,
    onChange: (date: null | moment.Moment) =>
      console.log("Date changed:", date),
  },
};
