import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Text } from "../text";

import { DragAndDrop } from "./DragAndDrop";

import { DragAndDropProps } from "./DragAndDrop.types";

const meta = {
  title: "Components/DragAndDrop",
  component: DragAndDrop,
  argTypes: {
    onDrop: { action: "onDrop" },
    targetFile: { action: "File: ", table: { disable: true } },
    onMouseDown: { action: "onMouseDown" },
  },
  parameters: {
    docs: {
      description: {
        component: `Drag And Drop component can be used as Dropzone.

See documentation: https://github.com/react-dropzone/react-dropzone
        `,
      },
    },
  },
} satisfies Meta<typeof DragAndDrop>;
type Story = StoryObj<typeof DragAndDrop>;

export default meta;

const Template = (args: DragAndDropProps) => {
  const onDrop = (items: File[]) => {
    const { onDrop: onDropProp, targetFile } = args;
    onDropProp?.(items);

    items.forEach((file) => targetFile?.(file.name));
  };

  return (
    <DragAndDrop
      {...args}
      isDropZone
      onDrop={onDrop}
      style={{ margin: 16, width: 200, height: 200 }}
    >
      <Text
        style={{ textAlign: "center", lineHeight: "9.5em" }}
        color="#999"
        fontSize="20px"
      >
        Drop items here
      </Text>
    </DragAndDrop>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
};
