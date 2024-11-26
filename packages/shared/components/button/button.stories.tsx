/* eslint-disable no-alert */
import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Icon from "PUBLIC_DIR/images/button.alert.react.svg";
import { Button, ButtonSize } from ".";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
Button is a versatile component for triggering actions in the UI.

Features:
- Multiple sizes (small, normal, medium, big)
- Primary and secondary variants
- Support for icons
- Loading state
- Disabled state
- Hover and active states
- Full-width (scale) option
- Themeable through styled-components

Usage:
\`\`\`tsx
import { Button, ButtonSize } from "@docspace/components";

// Primary button
<Button primary label="Click me" />

// Secondary button with icon
<Button 
  label="With Icon" 
  icon={<Icon />} 
  size={ButtonSize.normal} 
/>

// Loading state
<Button 
  primary 
  label="Loading" 
  isLoading 
/>

// Full width button
<Button 
  label="Full Width" 
  scale 
/>
\`\`\`
`,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=62-3582&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    primary: {
      control: "boolean",
      description: "Primary variant with filled background",
      defaultValue: false,
    },
    size: {
      control: "select",
      options: Object.values(ButtonSize),
      description: "Button size variant",
      defaultValue: ButtonSize.normal,
    },
    label: {
      control: "text",
      description: "Button text content",
    },
    icon: {
      control: { type: "boolean" },
      description: "Optional icon element",
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading spinner",
      defaultValue: false,
    },
    isDisabled: {
      control: "boolean",
      description: "Disables button interactions",
      defaultValue: false,
    },
    scale: {
      control: "boolean",
      description: "Makes button full width",
      defaultValue: false,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const Wrapper = (props: { isScale: boolean; children: React.ReactNode }) => {
  const { isScale, children } = props;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isScale
          ? "1fr"
          : "repeat( auto-fill, minmax(180px, 1fr) )",
        gridGap: "16px",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

export const Default: Story = {
  args: {
    size: ButtonSize.normal,
    label: "Button",
    onClick: () => alert("Button clicked"),
  },
};

const PrimaryTemplate = () => {
  return (
    <>
      <h3>Sizes</h3>
      <Wrapper isScale={false}>
        {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
          <Button
            key={`primary-${size}`}
            primary
            size={size}
            label={`${size[0].toUpperCase()}${size.slice(1)}`}
            onClick={() => {}}
          />
        ))}
      </Wrapper>

      <h3 style={{ marginTop: "24px" }}>States</h3>
      <Wrapper isScale={false}>
        <Button primary size={ButtonSize.normal} label="Default" />
        <Button
          primary
          size={ButtonSize.normal}
          icon={<Icon />}
          label="With Icon"
        />
        <Button primary size={ButtonSize.normal} isLoading label="Loading" />
        <Button primary size={ButtonSize.normal} isDisabled label="Disabled" />
      </Wrapper>

      <h3 style={{ marginTop: "24px" }}>Interactions</h3>
      <Wrapper isScale={false}>
        <Button primary size={ButtonSize.normal} isHovered label="Hover" />
        <Button primary size={ButtonSize.normal} isClicked label="Active" />
        <Button
          primary
          size={ButtonSize.normal}
          scale
          label="Full Width"
          style={{ gridColumn: "1 / -1" }}
        />
      </Wrapper>
    </>
  );
};

const SecondaryTemplate = () => {
  return (
    <>
      <h3>Sizes</h3>
      <Wrapper isScale={false}>
        {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
          <Button
            key={`secondary-${size}`}
            size={size}
            label={`${size[0].toUpperCase()}${size.slice(1)}`}
          />
        ))}
      </Wrapper>

      <h3 style={{ marginTop: "24px" }}>States</h3>
      <Wrapper isScale={false}>
        <Button size={ButtonSize.normal} label="Default" />
        <Button size={ButtonSize.normal} icon={<Icon />} label="With Icon" />
        <Button size={ButtonSize.normal} isLoading label="Loading" />
        <Button size={ButtonSize.normal} isDisabled label="Disabled" />
      </Wrapper>

      <h3 style={{ marginTop: "24px" }}>Interactions</h3>
      <Wrapper isScale={false}>
        <Button size={ButtonSize.normal} isHovered label="Hover" />
        <Button size={ButtonSize.normal} isClicked label="Active" />
        <Button
          size={ButtonSize.normal}
          scale
          label="Full Width"
          style={{ gridColumn: "1 / -1" }}
        />
      </Wrapper>
    </>
  );
};

const WithIconTemplate = () => {
  return (
    <Wrapper isScale={false}>
      <Button
        primary
        size={ButtonSize.normal}
        icon={<Icon />}
        label="Primary with Icon"
      />
      <Button
        size={ButtonSize.normal}
        icon={<Icon />}
        label="Secondary with Icon"
      />
      <Button
        primary
        size={ButtonSize.normal}
        icon={<Icon />}
        isDisabled
        label="Disabled with Icon"
      />
      <Button
        primary
        size={ButtonSize.normal}
        icon={<Icon />}
        isLoading
        label="Loading with Icon"
      />
    </Wrapper>
  );
};

const StateTemplate = () => {
  return (
    <Wrapper isScale={false}>
      <Button primary size={ButtonSize.normal} label="Primary Default" />
      <Button
        primary
        size={ButtonSize.normal}
        isHovered
        label="Primary Hover"
      />
      <Button
        primary
        size={ButtonSize.normal}
        isClicked
        label="Primary Active"
      />
      <Button
        primary
        size={ButtonSize.normal}
        isDisabled
        label="Primary Disabled"
      />
      <Button size={ButtonSize.normal} label="Secondary Default" />
      <Button size={ButtonSize.normal} isHovered label="Secondary Hover" />
      <Button size={ButtonSize.normal} isClicked label="Secondary Active" />
      <Button size={ButtonSize.normal} isDisabled label="Secondary Disabled" />
    </Wrapper>
  );
};

const LoadingTemplate = () => {
  return (
    <Wrapper isScale={false}>
      <Button
        primary
        size={ButtonSize.normal}
        isLoading
        label="Primary Loading"
      />
      <Button size={ButtonSize.normal} isLoading label="Secondary Loading" />
      <Button
        primary
        size={ButtonSize.normal}
        isLoading
        isDisabled
        label="Disabled Loading"
      />
    </Wrapper>
  );
};

const ScaleTemplate = () => {
  return (
    <Wrapper isScale>
      <Button
        primary
        scale
        size={ButtonSize.normal}
        label="Full Width Primary"
      />
      <Button scale size={ButtonSize.normal} label="Full Width Secondary" />
    </Wrapper>
  );
};

export const PrimaryButtons: Story = {
  render: () => <PrimaryTemplate />,
  parameters: {
    docs: {
      description: {
        story: "Primary buttons with different sizes",
      },
    },
  },
};

export const SecondaryButtons: Story = {
  render: () => <SecondaryTemplate />,
  parameters: {
    docs: {
      description: {
        story: "Secondary buttons with different sizes",
      },
    },
  },
};

export const WithIconButtons: Story = {
  render: () => <WithIconTemplate />,
  parameters: {
    docs: {
      description: {
        story: "Buttons with icons in different states",
      },
    },
  },
};

export const ButtonStates: Story = {
  render: () => <StateTemplate />,
  parameters: {
    docs: {
      description: {
        story: "Button states: default, hover, active, and disabled",
      },
    },
  },
};

export const LoadingButtons: Story = {
  render: () => <LoadingTemplate />,
  parameters: {
    docs: {
      description: {
        story: "Buttons in loading state",
      },
    },
  },
};

export const ScaleButtons: Story = {
  render: () => <ScaleTemplate />,
  parameters: {
    docs: {
      description: {
        story: "Full width buttons",
      },
    },
  },
};
