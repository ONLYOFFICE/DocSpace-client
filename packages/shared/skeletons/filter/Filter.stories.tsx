import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { FilterLoader } from "./Filter";
import FilterBlockLoader from "./FilterBlock";

const meta = {
  title: "Skeletons/Filter",
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton components for filters",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultFilter: Story = {
  name: "Default Filter",
  render: () => <FilterLoader />,
  parameters: {
    docs: {
      description: {
        story: "Default filter skeleton",
      },
    },
  },
};

export const RoomsFilterBlock: Story = {
  name: "Rooms Filter Block",
  render: () => <FilterBlockLoader isRooms />,
  parameters: {
    docs: {
      description: {
        story: "Filter block skeleton for rooms",
      },
    },
  },
};

export const ContactsFilterBlock: Story = {
  name: "Contacts Filter Block",
  render: () => <FilterBlockLoader isContactsPage />,
  parameters: {
    docs: {
      description: {
        story: "Filter block skeleton for contacts page",
      },
    },
  },
};

export const ContactsPeopleFilterBlock: Story = {
  name: "Contacts People Filter Block",
  render: () => <FilterBlockLoader isContactsPeoplePage />,
  parameters: {
    docs: {
      description: {
        story: "Filter block skeleton for contacts people page",
      },
    },
  },
};

export const ContactsGroupsFilterBlock: Story = {
  name: "Contacts Groups Filter Block",
  render: () => <FilterBlockLoader isContactsGroupsPage />,
  parameters: {
    docs: {
      description: {
        story: "Filter block skeleton for contacts groups page",
      },
    },
  },
};

export const ContactsInsideGroupFilterBlock: Story = {
  name: "Contacts Inside Group Filter Block",
  render: () => <FilterBlockLoader isContactsInsideGroupPage />,
  parameters: {
    docs: {
      description: {
        story: "Filter block skeleton for contacts inside group page",
      },
    },
  },
};

export const ContactsGuestsFilterBlock: Story = {
  name: "Contacts Guests Filter Block",
  render: () => <FilterBlockLoader isContactsGuestsPage />,
  parameters: {
    docs: {
      description: {
        story: "Filter block skeleton for contacts guests page",
      },
    },
  },
};

export const AllFilters: Story = {
  name: "All Filter Types",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h3>Default Filter</h3>
        <FilterLoader />
      </div>

      <div>
        <h3>Rooms Filter Block</h3>
        <FilterBlockLoader isRooms />
      </div>

      <div>
        <h3>Contacts Filter Block</h3>
        <FilterBlockLoader isContactsPage />
      </div>

      <div>
        <h3>Contacts People Filter Block</h3>
        <FilterBlockLoader isContactsPeoplePage />
      </div>

      <div>
        <h3>Contacts Groups Filter Block</h3>
        <FilterBlockLoader isContactsGroupsPage />
      </div>

      <div>
        <h3>Contacts Inside Group Filter Block</h3>
        <FilterBlockLoader isContactsInsideGroupPage />
      </div>

      <div>
        <h3>Contacts Guests Filter Block</h3>
        <FilterBlockLoader isContactsGuestsPage />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All filter skeleton types displayed together",
      },
    },
  },
};
