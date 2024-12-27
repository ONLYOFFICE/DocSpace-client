import type { Meta, StoryObj } from "@storybook/react";
import { FormWrapper } from "./index";

const meta: Meta<typeof FormWrapper> = {
  title: "Components/FormWrapper",
  component: FormWrapper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A wrapper component for forms that provides consistent styling and accessibility features.",
      },
    },
  },
  argTypes: {
    className: { control: "text" },
    id: { control: "text" },
    role: { control: "text" },
    "aria-label": { control: "text" },
    "aria-labelledby": { control: "text" },
    style: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof FormWrapper>;

export const Default: Story = {
  args: {
    children: <div style={{ padding: "20px" }}>Form Content</div>,
  },
};

export const WithCustomStyle: Story = {
  args: {
    children: <div style={{ padding: "20px" }}>Form with Custom Style</div>,
    style: { backgroundColor: "#f5f5f5" },
  },
};

export const WithAriaLabels: Story = {
  args: {
    children: <div style={{ padding: "20px" }}>Accessible Form</div>,
    "aria-label": "Registration Form",
    role: "form",
  },
};
