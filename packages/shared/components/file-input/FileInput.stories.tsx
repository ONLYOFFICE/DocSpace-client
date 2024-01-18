import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { InputSize } from "../text-input";

import { FileInputProps } from "./FileInput.types";
import { FileInputPure } from "./FileInput";

const meta = {
  title: "Components/FileInput",
  component: FileInputPure,
  argTypes: {
    onInput: { action: "onInput" },
  },
  parameters: {
    docs: {
      description: {
        component: "File entry field",
      },
    },
  },
} satisfies Meta<typeof FileInputPure>;
type Story = StoryObj<typeof FileInputPure>;

export default meta;

const Template = (args: FileInputProps) => {
  const { onInput } = args;
  return (
    <FileInputPure
      {...args}
      onInput={(file: File) => {
        onInput?.(file);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Input file",
    size: InputSize.base,
    scale: false,
    isDisabled: false,
    id: "file-input-id",
    name: "demoFileInputName",
    hasError: false,
    hasWarning: false,
    accept: [".doc", ".docx"],
  },
};
