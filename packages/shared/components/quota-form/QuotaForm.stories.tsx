import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { QuotaForm } from "./index";

const meta: Meta<typeof QuotaForm> = {
  title: "Components/QuotaForm",
  component: QuotaForm,
  parameters: {
    docs: {
      description: {
        component:
          "Form component for setting quota limits with size and unit selection",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSetQuotaBytesSize: { action: "onSetQuotaBytesSize" },
    onSave: { action: "onSave" },
    onCancel: { action: "onCancel" },
    isLoading: {
      control: "boolean",
      description: "Shows loading state of the form",
    },
    isError: {
      control: "boolean",
      description: "Shows error state of the input",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the form inputs",
    },
    isButtonsEnable: {
      control: "boolean",
      description: "Shows save/cancel buttons",
    },
    initialSize: {
      control: "number",
      description: "Initial size in bytes. Use -1 for unlimited",
    },
    maxInputWidth: {
      control: "text",
      description: "Maximum width of the input field",
    },
    label: {
      control: "text",
      description: "Label text for the form",
    },
    checkboxLabel: {
      control: "text",
      description: "Label for the unlimited checkbox option",
    },
    description: {
      control: "text",
      description: "Description text displayed below the label",
    },
    isAutoFocussed: {
      control: "boolean",
      description: "Automatically focus the input field",
    },
    tabIndex: {
      control: "number",
      description: "Tab index for the input field",
    },
  },
};

export default meta;
type Story = StoryObj<typeof QuotaForm>;

export const Default: Story = {
  args: {
    isLoading: false,
    isError: false,
    isDisabled: false,
    isButtonsEnable: true,
    initialSize: 1048576,
    maxInputWidth: "300px",
    label: "Storage Quota",
    description: "Set the maximum storage limit for this user",
    onSetQuotaBytesSize: action("onSetQuotaBytesSize"),
    onSave: action("onSave"),
    onCancel: action("onCancel"),
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    isError: true,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const WithoutButtons: Story = {
  args: {
    ...Default.args,
    isButtonsEnable: false,
  },
};

export const WithUnlimitedOption: Story = {
  args: {
    ...Default.args,
    checkboxLabel: "Unlimited storage",
  },
};

export const UnlimitedSelected: Story = {
  args: {
    ...Default.args,
    checkboxLabel: "Unlimited storage",
    initialSize: -1,
  },
};

export const LargeQuota: Story = {
  args: {
    ...Default.args,
    initialSize: 1099511627776, // 1 TB
  },
};

export const CustomWidth: Story = {
  args: {
    ...Default.args,
    maxInputWidth: "500px",
  },
};

export const AutoFocused: Story = {
  args: {
    ...Default.args,
    isAutoFocussed: true,
  },
  parameters: {
    docs: { disable: true },
  },
};
