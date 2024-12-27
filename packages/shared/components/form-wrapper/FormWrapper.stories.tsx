import React from "react";
import styled from "styled-components";

import { Meta, StoryObj } from "@storybook/react";
import { FormWrapper } from "./index";

const meta: Meta<typeof FormWrapper> = {
  title: "Base UI Components/FormWrapper",
  component: FormWrapper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "FormWrapper is a container component that provides consistent styling for forms across the application.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormWrapper>;

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
  },
};
