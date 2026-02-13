import React from "react";
import { Meta, StoryFn } from "@storybook/react";

import DragAndDrop from "./DragAndDrop";
import { DragAndDropProps } from "./DragAndDrop.types";

export default {
  title: "Interactive elements/DragAndDrop",
  component: DragAndDrop,
  parameters: {
    docs: {
      description: {
        component:
          "DragAndDrop component for handling file drag and drop operations",
      },
    },
  },
  argTypes: {
    isDropZone: {
      control: "boolean",
      description: "Sets the component as a dropzone",
    },
    dragging: {
      control: "boolean",
      description: "Shows that the item is being dragged now",
    },
    onDrop: {
      action: "dropped",
      description: "Callback when files are dropped",
    },
    onDragOver: {
      action: "dragOver",
      description: "Callback when dragging over the zone",
    },
    onDragLeave: {
      action: "dragLeave",
      description: "Callback when dragging leaves the zone",
    },
  },
} as Meta;

const Template: StoryFn<DragAndDropProps> = (args) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (
    isDragActive: boolean,
    e: React.DragEvent<HTMLElement>,
  ) => {
    setIsDragging(isDragActive);
    args.onDragOver?.(isDragActive, e);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(false);
    args.onDragLeave?.(e);
  };

  const handleDrop = (files: File[]) => {
    setIsDragging(false);
    args.onDrop?.(files);
  };

  const dropZoneStyle: React.CSSProperties = {
    width: "300px",
    height: "200px",
    border: `2px dashed ${isDragging ? "#2DA7DB" : "#D0D5DA"}`,
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    backgroundColor: isDragging ? "#F8F9F9" : "transparent",
  };

  const textStyle: React.CSSProperties = {
    margin: 0,
    color: "var(--text-color)",
    textAlign: "center",
  };

  return (
    <DragAndDrop
      {...args}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={dropZoneStyle}>
        <p style={textStyle}>
          {isDragging
            ? "Drop files here"
            : "Drag and drop files here or click to select"}
        </p>
      </div>
    </DragAndDrop>
  );
};

export const Default = Template.bind({});
Default.args = {
  isDropZone: true,
};

export const WithDraggingState = Template.bind({});
WithDraggingState.args = {
  isDropZone: true,
  dragging: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  isDropZone: false,
};
