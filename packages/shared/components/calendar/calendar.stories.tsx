import React, { useState } from "react";
import moment from "moment";
import { Meta, StoryObj } from "@storybook/react";

import { Calendar } from "./Calendar";
import { CalendarProps } from "./Calendar.types";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  argTypes: {
    maxDate: { control: "date" },
    minDate: { control: "date" },
    initialDate: { control: "date" },
    locale: {
      type: "string",
      options: [
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
      ],
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Used to display custom calendar",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=651-4406&mode=design&t=RrB9MOQGCnUPghij-0",
    },
  },
} satisfies Meta<typeof Calendar>;
type Story = StoryObj<typeof Calendar>;

export default meta;

const Template = ({ locale, minDate, maxDate, ...args }: CalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  return (
    <Calendar
      {...args}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      minDate={minDate}
      maxDate={maxDate}
      locale={locale}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    locale: "en",
    maxDate: new Date(`${new Date().getFullYear() + 10}/01/01`),
    minDate: new Date("1970/01/01"),
    initialDate: moment(),
  },
};
