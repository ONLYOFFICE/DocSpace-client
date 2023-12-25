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
  },
  parameters: {
    docs: {
      description: {
        component: "Date input",
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

const Template = ({ ...args }: DatePickerProps) => {
  return (
    <Wrapper>
      <DatePicker {...args} />
    </Wrapper>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    maxDate: new Date(`${new Date().getFullYear() + 10}/01/01`),
    minDate: new Date("1970/01/01"),
    openDate: moment(),
    initialDate: moment(),
    onChange: () => {},
    locale: "en",
  },
};
