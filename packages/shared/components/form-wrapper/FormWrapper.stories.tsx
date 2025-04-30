import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { FormWrapper } from "./index";

import styles from "./FormWrapper.module.scss";

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

export const Default: Story = {
  args: {
    children: (
      <div className={styles.storybookDemoContent}>
        <h3>Welcome</h3>
        <p>This is a basic form wrapper example</p>
      </div>
    ),
  },
};

export const WithLoginForm: Story = {
  args: {
    children: (
      <form className={styles.storybookDemoForm}>
        <input
          className={styles.storybookDemoInput}
          type="email"
          placeholder="Email"
        />
        <input
          className={styles.storybookDemoInput}
          type="password"
          placeholder="Password"
        />
        <button className={styles.storybookDemoButton} type="submit">
          Sign In
        </button>
      </form>
    ),
  },
};

export const WithRegistrationForm: Story = {
  args: {
    children: (
      <form className={styles.storybookDemoForm}>
        <input
          className={styles.storybookDemoInput}
          type="text"
          placeholder="Full Name"
        />
        <input
          className={styles.storybookDemoInput}
          type="email"
          placeholder="Email"
        />
        <input
          className={styles.storybookDemoInput}
          type="password"
          placeholder="Password"
        />
        <input
          className={styles.storybookDemoInput}
          type="password"
          placeholder="Confirm Password"
        />
        <button className={styles.storybookDemoButton} type="submit">
          Create Account
        </button>
      </form>
    ),
  },
};
