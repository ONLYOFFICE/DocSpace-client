import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import Section from "./index";
import { DeviceType } from "../../enums";

const meta: Meta<typeof Section> = {
  title: "Layout Components/Section",
  component: Section,
  parameters: {
    docs: {
      description: {
        component:
          "Section component with header, body, and various sub-components",
      },
    },
  },
  argTypes: {
    currentDeviceType: {
      control: "select",
      options: Object.values(DeviceType),
      defaultValue: DeviceType.desktop,
    },
    withBodyScroll: {
      control: "boolean",
      defaultValue: true,
    },
    isHeaderVisible: {
      control: "boolean",
      defaultValue: true,
    },
    isInfoPanelAvailable: {
      control: "boolean",
      defaultValue: false,
    },
    isInfoPanelVisible: {
      control: "boolean",
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    currentDeviceType: DeviceType.desktop,
    withBodyScroll: true,
    isHeaderVisible: true,
  },
  render: (args) => (
    <div style={{ width: "300px", height: "600px" }}>
      <Section {...args}>
        <Section.SectionHeader>Header Content</Section.SectionHeader>
        <Section.SectionFilter>Filter Content</Section.SectionFilter>
        <Section.SectionBody>Body Content</Section.SectionBody>
        <Section.SectionFooter>Footer Content</Section.SectionFooter>
      </Section>
    </div>
  ),
};
