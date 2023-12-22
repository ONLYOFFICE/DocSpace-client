import { Meta, StoryObj } from "@storybook/react";

import { Tags } from "./Tags";

type TagsType = typeof Tags;
type Story = StoryObj<TagsType>;

const meta: Meta<TagsType> = {
  title: "Components/Tags",
  component: Tags,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=62-2597&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
};

export default meta;

export const Default: Story = {
  args: {
    tags: ["tag1", "tag2"],
    columnCount: 2,
    onSelectTag: () => {},
  },
};
