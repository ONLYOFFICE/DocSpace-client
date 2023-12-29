import React from "react";
import styled from "styled-components";
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
        component: "Date-time input",
      },
    },
  },
} satisfies Meta<typeof DateTimePicker>;
type Story = StoryObj<typeof DateTimePicker>;

export default meta;

const Wrapper = styled.div`
  height: 500px;
`;

const Template = ({ ...args }: DateTimePickerProps) => {
  return (
    <Wrapper>
      <DateTimePicker {...args} />
    </Wrapper>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    locale: "en",
    maxDate: new Date(`${new Date().getFullYear() + 10}/01/01`),
    minDate: new Date("1970/01/01"),
    openDate: moment(),
  },
};
