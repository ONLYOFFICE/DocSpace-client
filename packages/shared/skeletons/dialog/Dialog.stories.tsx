import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { DialogSkeleton } from "./index";
import { DialogAsideSkeleton } from "./Dialog.aside";
import { DialogInvitePanelSkeleton } from "./Dialog.invite";
import { DialogReassignmentSkeleton } from "./Dialog.reassignment";

const meta = {
  title: "Skeletons/Dialog",
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton components for various dialog types",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultDialog: Story = {
  name: "Default Dialog",
  render: () => <DialogSkeleton isLarge={false} withFooterBorder={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "Default dialog skeleton with standard size and no footer border",
      },
    },
  },
};

export const LargeDialog: Story = {
  name: "Large Dialog",
  render: () => <DialogSkeleton isLarge withFooterBorder />,
  parameters: {
    docs: {
      description: {
        story: "Large dialog skeleton with footer border",
      },
    },
  },
};

export const AsideDialog: Story = {
  name: "Aside Dialog",
  render: () => (
    <div style={{ height: "500px", position: "relative" }}>
      <DialogAsideSkeleton
        isPanel={false}
        withoutAside={false}
        withFooterBorder
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Aside dialog skeleton with footer border",
      },
    },
  },
};

export const PanelDialog: Story = {
  name: "Panel Dialog",
  render: () => (
    <div style={{ height: "500px", position: "relative" }}>
      <DialogAsideSkeleton isPanel withoutAside={false} withFooterBorder />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Panel dialog skeleton with footer border",
      },
    },
  },
};

export const InvitePanel: Story = {
  name: "Invite Panel",
  render: () => (
    <div style={{ height: "500px", position: "relative" }}>
      <DialogInvitePanelSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Invite panel skeleton with external links and input sections",
      },
    },
  },
};

export const ReassignmentDialog: Story = {
  name: "Reassignment Dialog",
  render: () => <DialogReassignmentSkeleton />,
  parameters: {
    docs: {
      description: {
        story:
          "Data reassignment dialog skeleton showing user and new owner sections",
      },
    },
  },
};

export const AllDialogs: Story = {
  name: "All Dialog Types",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h3>Default Dialog</h3>
        <DialogSkeleton isLarge={false} withFooterBorder={false} />
      </div>

      <div>
        <h3>Large Dialog</h3>
        <DialogSkeleton isLarge withFooterBorder />
      </div>

      <div style={{ height: "500px", position: "relative" }}>
        <h3>Aside Dialog</h3>
        <DialogAsideSkeleton
          isPanel={false}
          withoutAside={false}
          withFooterBorder
        />
      </div>

      <div style={{ height: "500px", position: "relative" }}>
        <h3>Panel Dialog</h3>
        <DialogAsideSkeleton isPanel withoutAside={false} withFooterBorder />
      </div>

      <div style={{ height: "500px", position: "relative" }}>
        <h3>Invite Panel</h3>
        <DialogInvitePanelSkeleton />
      </div>

      <div>
        <h3>Reassignment Dialog</h3>
        <DialogReassignmentSkeleton />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All dialog skeleton types displayed together",
      },
    },
  },
};
