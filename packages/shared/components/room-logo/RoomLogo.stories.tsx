import { Meta, StoryObj } from "@storybook/react";
import { RoomsType } from "../../enums";

import { RoomLogoPure } from "./RoomLogo";

const meta = {
  title: "Components/RoomLogo",
  component: RoomLogoPure,
  parameters: {
    docs: {
      description: {
        component:
          "Room logo allow you display default room logo depend on type and private",
      },
    },
  },
  // argTypes: {
  //   type: {
  //     options: ["Editing Room", "Custom Room"],
  //     control: { type: "select" },
  //   },
  // },
} satisfies Meta<typeof RoomLogoPure>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: {
    type: RoomsType.CustomRoom,
    isPrivacy: false,
    isArchive: false,
    withCheckbox: false,
    isChecked: false,
    isIndeterminate: false,
    onChange: () => {},
  },
};
