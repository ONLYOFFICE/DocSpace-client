import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { InfiniteLoaderComponent } from "./InfiniteLoader";

const generateItems = (count: number) =>
  Array(count)
    .fill(null)
    .map((_, index) => (
      <div
        key="wrap"
        style={{
          padding: "8px",
          border: "1px solid #eee",
          margin: "4px",
          borderRadius: "4px",
        }}
      >
        Item {index + 1}
      </div>
    ));

const meta: Meta<typeof InfiniteLoaderComponent> = {
  title: "Base UI components/InfiniteLoader",
  component: InfiniteLoaderComponent,
  parameters: {
    docs: {
      description: {
        component:
          "InfiniteLoader component for handling large lists of items with virtualization support",
      },
    },
  },
  argTypes: {
    viewAs: {
      control: "select",
      options: ["tile", "row", "table"],
      description: "Display mode for the items",
    },
    isLoading: {
      control: "boolean",
      description: "Loading state of the component",
    },
    itemSize: {
      control: "number",
      description: "Height of each item in pixels",
    },
    hasMoreFiles: {
      control: "boolean",
      description: "Whether there are more items to load",
    },
  },
};

export default meta;
type Story = StoryObj<typeof InfiniteLoaderComponent>;

const Template: Story = {
  args: {
    viewAs: "tile",
    hasMoreFiles: true,
    filesLength: 100,
    itemCount: 20,
    itemSize: 50,
    loadMoreItems: async ({ startIndex, stopIndex }) => {
      action("loadMoreItems")({ startIndex, stopIndex });
      // Simulate API delay
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    },
    children: generateItems(20),
    isLoading: false,
  },
};

export const Tile = {
  ...Template,
  args: {
    ...Template.args,
    viewAs: "tile",
  },
};

export const Row = {
  ...Template,
  args: {
    ...Template.args,
    viewAs: "row",
  },
};

export const Table = {
  ...Template,
  args: {
    ...Template.args,
    viewAs: "table",
  },
};

export const Loading = {
  ...Template,
  args: {
    ...Template.args,
    isLoading: true,
  },
};

export const NoMoreItems = {
  ...Template,
  args: {
    ...Template.args,
    hasMoreFiles: false,
  },
};

export const EmptyList = {
  ...Template,
  args: {
    ...Template.args,
    children: [],
    itemCount: 0,
    filesLength: 0,
  },
};
