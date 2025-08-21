import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AsideHeader } from ".";

const meta: Meta<typeof AsideHeader> = {
  title: "Base UI Components/AsideHeader",
  component: AsideHeader,
  parameters: {
    docs: {
      description: {
        component:
          "AsideHeader component is used for displaying a header in aside panels or dialogs with optional back and close buttons.",
      },
    },
  },
  argTypes: {
    header: {
      control: "text",
      description: "Header content - can be string or ReactNode",
    },
    isBackButton: {
      control: "boolean",
      description: "Show back button",
    },
    isCloseable: {
      control: "boolean",
      description: "Show close button",
    },
    withoutBorder: {
      control: "boolean",
      description: "Remove bottom border",
    },
    headerHeight: {
      control: "text",
      description: "Custom header height",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AsideHeader>;

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: "450px" }}>{children}</div>
);

export const Default: Story = {
  render: (args) => (
    <Wrapper>
      <AsideHeader {...args} />
    </Wrapper>
  ),
  args: {
    header: "Default Header",
    isCloseable: true,
    onCloseClick: () => console.log("Close clicked"),
  },
};

export const WithBackButton: Story = {
  render: (args) => (
    <Wrapper>
      <AsideHeader {...args} />
    </Wrapper>
  ),
  args: {
    header: "Header with Back Button",
    isBackButton: true,
    onBackClick: () => console.log("Back clicked"),
    isCloseable: true,
    onCloseClick: () => console.log("Close clicked"),
  },
};

export const Loading: Story = {
  render: (args) => (
    <Wrapper>
      <AsideHeader {...args} />
    </Wrapper>
  ),
  args: {
    header: "Loading Header",
    isLoading: true,
    isCloseable: true,
    onCloseClick: () => console.log("Close clicked"),
  },
};

export const WithoutBorder: Story = {
  render: (args) => (
    <Wrapper>
      <AsideHeader {...args} />
    </Wrapper>
  ),
  args: {
    header: "Header without Border",
    withoutBorder: true,
    isCloseable: true,
    onCloseClick: () => console.log("Close clicked"),
  },
};

export const CustomHeight: Story = {
  render: (args) => (
    <Wrapper>
      <AsideHeader {...args} />
    </Wrapper>
  ),
  args: {
    header: "Custom Height Header",
    headerHeight: "70px",
    isCloseable: true,
    onCloseClick: () => console.log("Close clicked"),
  },
};
