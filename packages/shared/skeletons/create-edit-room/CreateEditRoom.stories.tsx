import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import CreateEditRoomDilogHeaderLoader from "./DilogHeader";
import RoomTypeListLoader from "./RoomTypeList";
import SetRoomParamsLoader from "./SetRoomParams";

const meta = {
  title: "Skeletons/CreateEditRoom",
  parameters: {
    docs: {
      description: {
        component:
          "Loading skeleton components for the Create/Edit Room dialog",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DialogHeader: Story = {
  name: "Dialog Header",
  render: () => <CreateEditRoomDilogHeaderLoader />,
  parameters: {
    docs: {
      description: {
        story:
          "Loading skeleton for the dialog header showing a title placeholder",
      },
    },
  },
};

export const RoomTypeList: Story = {
  name: "Room Type List",
  render: () => <RoomTypeListLoader />,
  parameters: {
    docs: {
      description: {
        story:
          "Loading skeleton for the room type selection list showing multiple room type options",
      },
    },
  },
};

export const SetRoomParams: Story = {
  name: "Set Room Parameters",
  render: () => <SetRoomParamsLoader />,
  parameters: {
    docs: {
      description: {
        story:
          "Loading skeleton for the room parameters form showing input fields and text area placeholders",
      },
    },
  },
};

export const FullDialog: Story = {
  name: "Full Dialog",
  render: () => (
    <div style={{ width: "100%", maxWidth: "600px", padding: "20px" }}>
      <CreateEditRoomDilogHeaderLoader />
      <div style={{ marginTop: "20px" }}>
        <RoomTypeListLoader />
      </div>
      <div style={{ marginTop: "20px" }}>
        <SetRoomParamsLoader />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete create/edit room dialog showing all skeleton components together",
      },
    },
  },
};
