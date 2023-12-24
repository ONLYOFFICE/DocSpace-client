import { Meta, StoryObj } from "@storybook/react";

import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";
import ShareLinkedinReactSvgUrl from "PUBLIC_DIR/images/share.linkedin.react.svg?url";

import { SocialButton } from "./SocialButton";

type SocialButtonType = typeof SocialButton;
type Story = StoryObj<SocialButtonType>;

const meta: Meta<SocialButtonType> = {
  title: "Components/SocialButtons",
  component: SocialButton,
  parameters: {
    docs: {
      description: {
        component: "Button is used for sign up with help social networks",
      },
    },
  },
  argTypes: {
    onClick: { action: "onClick" },
    iconName: {
      control: {
        type: "select",
      },
      options: [ShareGoogleReactSvgUrl, ShareLinkedinReactSvgUrl],
    },
  },
};

export default meta;

export const Default: Story = {
  args: {
    label: "Base SocialButton",
    iconName: ShareGoogleReactSvgUrl,
    isDisabled: false,
  },
};
