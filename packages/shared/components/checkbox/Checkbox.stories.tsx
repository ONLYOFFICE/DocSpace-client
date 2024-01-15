import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { CheckboxProps } from "./Checkbox.types";
import { CheckboxPure } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: CheckboxPure,
  parameters: {
    docs: {
      description: { component: "Custom checkbox input" },
    },
  },
  argTypes: {
    onChange: {
      action: "onChange",
    },
  },
} satisfies Meta<typeof CheckboxPure>;

type Story = StoryObj<typeof CheckboxPure>;
export default meta;

const AllCheckboxesTemplate = (args: CheckboxProps) => {
  const { onChange } = args;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat( auto-fill, minmax(120px, 1fr) )",
        gridGap: "16px",
        alignItems: "center",
      }}
    >
      <CheckboxPure onChange={onChange} />

      <CheckboxPure isChecked onChange={onChange} />

      <CheckboxPure isDisabled onChange={onChange} />

      <CheckboxPure isIndeterminate onChange={onChange} />

      <CheckboxPure label="Some label" onChange={onChange} />
    </div>
  );
};

export const Default: Story = {
  render: (args: CheckboxProps) => <CheckboxPure {...args} />,
  args: {
    label: "Checkbox label",
  },
};

export const AllCheckboxStates: Story = {
  render: () => <AllCheckboxesTemplate />,
};
