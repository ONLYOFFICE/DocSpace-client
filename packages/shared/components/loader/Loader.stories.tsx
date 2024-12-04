import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { globalColors } from "../../themes";
import { LoaderTypes } from "./Loader.enums";

import { Loader } from ".";

const meta = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    docs: {
      description: {
        component: `
          A versatile loader component for displaying loading states.
          
          ### Features
          - Multiple loader types (Base, DualRing, Oval, Rombs, Track)
          - Customizable size and color
          - Accessibility support
          - Theme integration
          - Primary and disabled states
        `,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=419-1989&node-type=canvas&t=cciHhBMEGnlQ38dp-0",
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: Object.values(LoaderTypes),
      description: "Type of loader animation",
    },
    color: {
      control: "color",
      description: "Custom color override",
    },
    size: {
      control: "text",
      description: "Size in pixels (e.g., '18px')",
    },
    label: {
      control: "text",
      description: "Accessibility label",
    },
    primary: {
      control: "boolean",
      description: "Primary variant",
    },
    isDisabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
} satisfies Meta<typeof Loader>;

type Story = StoryObj<typeof Loader>;

export default meta;

const Container = ({
  children,
  columns = 1,
  dark = false,
}: {
  children: React.ReactNode;
  columns?: number;
  dark?: boolean;
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "20px",
      padding: "20px",
      background: dark ? "var(--background-dark)" : "var(--background-primary)",
      borderRadius: "6px",
      minHeight: "100px",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <Container>
      <Loader {...args} />
    </Container>
  ),
  args: {
    type: LoaderTypes.base,
    size: "18px",
    label: "Loading content...",
  },
};

export const Types: Story = {
  render: () => (
    <Container columns={5}>
      {Object.values(LoaderTypes).map((type) => (
        <Loader
          key={type}
          type={type}
          size={type === LoaderTypes.base ? "18px" : "40px"}
          label={`${type} loader`}
        />
      ))}
    </Container>
  ),
};

export const States: Story = {
  render: () => (
    <Container columns={3}>
      <Loader type={LoaderTypes.dualRing} size="40px" label="Default state" />
      <Loader
        type={LoaderTypes.dualRing}
        size="40px"
        primary
        label="Primary state"
      />
      <Loader
        type={LoaderTypes.dualRing}
        size="40px"
        isDisabled
        label="Disabled state"
      />
    </Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Container columns={4}>
      {[
        { size: "20px", label: "Small" },
        { size: "40px", label: "Medium" },
        { size: "60px", label: "Large" },
        { size: "80px", label: "Extra Large" },
      ].map(({ size, label }) => (
        <Loader
          key={size}
          type={LoaderTypes.oval}
          size={size}
          label={`${label} (${size})`}
        />
      ))}
    </Container>
  ),
};

export const Colors: Story = {
  render: () => (
    <Container columns={4}>
      {[
        { color: globalColors.redRomb, name: "Red" },
        { color: globalColors.blueRomb, name: "Blue" },
        { color: globalColors.greenRomb, name: "Green" },
        { color: globalColors.loaderLight, name: "Light" },
      ].map(({ color, name }) => (
        <Loader
          key={name}
          type={LoaderTypes.track}
          size="40px"
          color={color}
          label={`${name} loader`}
        />
      ))}
    </Container>
  ),
};

export const ThemeVariants: Story = {
  render: () => (
    <>
      <Container columns={2}>
        <Loader type={LoaderTypes.dualRing} size="40px" label="Light theme" />
        <Loader
          type={LoaderTypes.dualRing}
          size="40px"
          primary
          label="Light theme primary"
        />
      </Container>
      <div style={{ height: "20px" }} />
      <Container columns={2} dark>
        <Loader type={LoaderTypes.dualRing} size="40px" label="Dark theme" />
        <Loader
          type={LoaderTypes.dualRing}
          size="40px"
          primary
          label="Dark theme primary"
        />
      </Container>
    </>
  ),
};

export const LoaderGroups: Story = {
  render: () => (
    <Container>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Loader type={LoaderTypes.base} size="18px" label="Small loader" />
        <span>Loading items</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Loader type={LoaderTypes.dualRing} size="40px" label="Main loader" />
        <span>Processing data</span>
      </div>
    </Container>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Container columns={3}>
      <div style={{ textAlign: "center" }}>
        <Loader
          type={LoaderTypes.oval}
          size="40px"
          style={{ marginBottom: "8px" }}
          label="Custom margin"
        />
        <div>With margin</div>
      </div>
      <div
        style={{ background: "#f5f5f5", padding: "16px", borderRadius: "4px" }}
      >
        <Loader type={LoaderTypes.oval} size="40px" label="Custom background" />
      </div>
      <div style={{ transform: "scale(1.2)" }}>
        <Loader type={LoaderTypes.oval} size="40px" label="Scaled loader" />
      </div>
    </Container>
  ),
};
