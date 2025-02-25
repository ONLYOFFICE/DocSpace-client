import { Meta, StoryObj } from "@storybook/react";

import { SectionHeaderSkeleton, SectionSubmenuSkeleton } from "./index";

const headerMeta = {
  title: "Skeletons/Sections/Header",
  component: SectionHeaderSkeleton,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for section headers",
      },
    },
  },
  argTypes: {
    title: {
      control: "object",
      description: "Title rectangle properties",
      defaultValue: {
        width: "100%",
        height: "24px",
      },
    },
    borderRadius: {
      control: "text",
      defaultValue: "3px",
      description: "Border radius for the skeleton rectangles",
    },
    backgroundColor: {
      control: "color",
      defaultValue: "#f8f9f9",
      description: "Background color for the skeleton",
    },
    foregroundColor: {
      control: "color",
      defaultValue: "#eee",
      description: "Foreground color for the skeleton animation",
    },
    backgroundOpacity: {
      control: "number",
      defaultValue: 1,
      description: "Opacity of the background",
    },
    foregroundOpacity: {
      control: "number",
      defaultValue: 1,
      description: "Opacity of the foreground",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SectionHeaderSkeleton>;

export default headerMeta;

type HeaderStory = StoryObj<typeof SectionHeaderSkeleton>;
type SubmenuStory = StoryObj<typeof SectionSubmenuSkeleton>;

export const DefaultHeader: HeaderStory = {
  args: {
    title: "",
    borderRadius: "3px",
    backgroundColor: "#f8f9f9",
    foregroundColor: "#eee",
    backgroundOpacity: 1,
    foregroundOpacity: 1,
  },
};

export const CustomStyledHeader: HeaderStory = {
  args: {
    ...DefaultHeader.args,
    backgroundColor: "#e5e5e5",
    foregroundColor: "#d1d1d1",
    borderRadius: "5px",
  },
};

export const NoAnimationHeader: HeaderStory = {
  args: {
    ...DefaultHeader.args,
  },
};

export const DefaultSubmenu: SubmenuStory = {
  args: {
    title: "Loading submenu...",
    style: { margin: "20px 0" },
  },
};

export const CustomStyledSubmenu: SubmenuStory = {
  args: {
    ...DefaultSubmenu.args,
    style: {
      margin: "20px 0",
      padding: "10px",
      backgroundColor: "#f5f5f5",
    },
  },
};
