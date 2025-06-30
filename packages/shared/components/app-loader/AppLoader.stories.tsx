import { Meta, StoryFn } from "@storybook/react";

import AppLoader from "./index";

export default {
  title: "Layout components/AppLoader",
  component: AppLoader,
  parameters: {
    docs: {
      description: {
        component:
          "Full-screen loader component used during application loading",
      },
    },
  },
} as Meta;

const Template: StoryFn = () => <AppLoader />;

// Example with custom background color
export const CustomBackground = Template.bind({});
CustomBackground.decorators = [
  (StoryComponent) => (
    <div style={{ width: "500px", height: "500px", position: "relative" }}>
      {StoryComponent()}
    </div>
  ),
];
