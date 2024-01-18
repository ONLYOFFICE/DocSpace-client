import { Meta, StoryObj } from "@storybook/react";
import { Submenu } from "./Submenu";

import { data, startSelect } from "./data";
import { SubmenuProps } from "./Submenu.types";

const meta = {
  title: "Components/Submenu",
  component: Submenu,
} satisfies Meta<typeof Submenu>;
type Story = StoryObj<typeof meta>;

export default meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      height: "170px",
    }}
  >
    {children}
  </div>
);

const Template = (args: SubmenuProps) => (
  <Wrapper>
    <Submenu {...args} />
  </Wrapper>
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    data,
    startSelect,
  },
};
