import React from "react";
import SocialButton from "./";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/share.google... Remove this comment to see the full error message
import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/share.linked... Remove this comment to see the full error message
import ShareLinkedinReactSvgUrl from "PUBLIC_DIR/images/share.linkedin.react.svg?url";

export default {
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
      options: [
        ShareGoogleReactSvgUrl,
        //"ShareFacebookIcon",
        //"ShareTwitterIcon",
        ShareLinkedinReactSvgUrl,
      ],
    },
  },
};

const Template = ({
  onClick,
  ...args
}: any) => {
  return (
    <div style={{ width: "200px", margin: "7px" }}>
      <SocialButton {...args} onClick={() => onClick("clicked")} />
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ onClick... Remove this comment to see the full error message
Default.args = {
  label: "Base SocialButton",
  iconName: ShareGoogleReactSvgUrl,
  isDisabled: false,
};
