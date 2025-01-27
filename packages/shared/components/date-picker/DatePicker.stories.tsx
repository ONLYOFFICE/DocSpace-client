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
import moment from "moment";
import { StoryObj, Meta } from "@storybook/react";
import styled from "styled-components";

import { DatePicker } from "./DatePicker";
import { DatePickerProps } from "./DatePicker.types";

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
  title: "Components/DatePicker",
  component: DatePicker,
  argTypes: {
    minDate: { control: "date" },
    maxDate: { control: "date" },
    initialDate: { control: "date" },
    openDate: { control: "date" },
    onChange: { action: "onChange" },
    locale: { control: "select", options: locales },
    selectDateText: { control: "text" },
    isMobile: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Date picker component that allows users to select dates with various configuration options",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/9AtdOHnhjhZCIRDrj4Unta/Public-room?type=design&node-id=1846-218508&mode=design&t=xSsXehQdoxpp5o7F-4",
    },
  },
} satisfies Meta<typeof DatePicker>;

type Story = StoryObj<typeof meta>;
export default meta;

const Wrapper = styled.div`
  height: 500px;
`;

const Template = (args: DatePickerProps) => {
  return (
    <Wrapper>
      <DatePicker {...args} />
    </Wrapper>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    maxDate: moment().add(10, "years").startOf("year"),
    minDate: moment("1970-01-01"),
    openDate: moment("2025-01-27"),
    initialDate: moment("2025-01-27"),
    locale: "en",
    selectDateText: "Select date",
    onChange: (date) =>
      console.log("Date changed:", date?.format("YYYY-MM-DD")),
  },
};

export const WithCustomDateRange: Story = {
  render: Template,
  args: {
    ...Default.args,
    minDate: moment().subtract(1, "month"),
    maxDate: moment().add(1, "month"),
    selectDateText: "Select date within 2 months range",
  },
};

export const WithDifferentLocale: Story = {
  render: Template,
  args: {
    ...Default.args,
    locale: "fr",
    selectDateText: "Sélectionnez une date",
  },
};

export const MobileView: Story = {
  render: Template,
  args: {
    ...Default.args,
    isMobile: true,
  },
};

export const WithCustomInitialDate: Story = {
  render: Template,
  args: {
    ...Default.args,
    initialDate: moment("2025-12-31"),
    openDate: moment("2025-12-31"),
    selectDateText: "Select date with custom initial value",
  },
};
