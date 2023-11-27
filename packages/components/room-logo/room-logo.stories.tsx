import React from "react";

import RoomLogo from ".";

export default {
  title: "Components/RoomLogo",
  component: RoomLogo,
  parameters: {
    docs: {
      description: {
        component:
          "Room logo allow you display default room logo depend on type and private",
      },
    },
  },
  argTypes: {
    type: {
      options: ["Editing Room", "Custom Room"],
      control: { type: "select" },
    },
  },
};

const Template = (args: any) => {
  const RoomType = {
    "Editing Room": 2,
    "Custom Room": 5,
  };
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return <RoomLogo {...args} type={RoomType[args.type]} />;
};

export const Default = Template.bind({});

// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  type: "Editing Room",
  isPrivacy: false,
  isArchive: false,
  withCheckbox: false,
  isChecked: false,
  isIndeterminate: false,
  onChange: () => console.log("checked"),
};
