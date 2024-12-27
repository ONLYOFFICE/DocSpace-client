<<<<<<< HEAD
import React from "react";
import styled from "styled-components";

import { Meta, StoryObj } from "@storybook/react";
import { FormWrapper } from "./index";

const meta: Meta<typeof FormWrapper> = {
  title: "Base UI Components/FormWrapper",
=======
import type { Meta, StoryObj } from "@storybook/react";
import { FormWrapper } from "./index";

const meta: Meta<typeof FormWrapper> = {
  title: "Components/FormWrapper",
>>>>>>> 2118dcdaa9a0a3817dddb413048e9d05ff983f0c
  component: FormWrapper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
<<<<<<< HEAD
          "FormWrapper is a container component that provides consistent styling for forms across the application.",
      },
    },
  },
=======
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
>>>>>>> 2118dcdaa9a0a3817dddb413048e9d05ff983f0c
};

export default meta;
type Story = StoryObj<typeof FormWrapper>;

<<<<<<< HEAD
const DemoContent = styled.div`
  width: 100%;
  text-align: center;
`;

const DemoForm = styled.form`
  width: 100%;
`;

const DemoInput = styled.input`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const DemoButton = styled.button`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  background-color: #2da7db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #1f8fc2;
  }
`;

export const Default: Story = {
  args: {
    children: (
      <DemoContent>
        <h3>Welcome</h3>
        <p>This is a basic form wrapper example</p>
      </DemoContent>
    ),
  },
};

export const WithLoginForm: Story = {
  args: {
    children: (
      <DemoForm>
        <DemoInput type="email" placeholder="Email" />
        <DemoInput type="password" placeholder="Password" />
        <DemoButton type="submit">Sign In</DemoButton>
      </DemoForm>
    ),
  },
};

export const WithRegistrationForm: Story = {
  args: {
    children: (
      <DemoForm>
        <DemoInput type="text" placeholder="Full Name" />
        <DemoInput type="email" placeholder="Email" />
        <DemoInput type="password" placeholder="Password" />
        <DemoInput type="password" placeholder="Confirm Password" />
        <DemoButton type="submit">Create Account</DemoButton>
      </DemoForm>
    ),
=======
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
>>>>>>> 2118dcdaa9a0a3817dddb413048e9d05ff983f0c
  },
};
