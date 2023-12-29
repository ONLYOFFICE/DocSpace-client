import { Meta, StoryObj } from "@storybook/react";
import { DropDownItem } from "../drop-down-item";

import { DropDown } from ".";
import { DropDownProps } from "./DropDown.types";

const meta = {
  title: "Components/DropDown",
  component: DropDown,
  // subcomponents: { DropDownItem },
  // argTypes: {
  //   onClick: { action: "onClickItem", table: { disable: true } },
  // },
  parameters: {
    docs: {
      description: {
        component: `Is a dropdown with any number of action
        By default, it is used with DropDownItem elements in role of children.

If you want to display something custom, you can put it in children, but take into account that all stylization is assigned to the implemented component.

When using component, it should be noted that parent must have CSS property _position: relative_. Otherwise, DropDown will appear outside parent's border.
`,
      },
    },
  },
} satisfies Meta<typeof DropDown>;
type Story = StoryObj<typeof DropDown>;

export default meta;

const Template = (args: DropDownProps) => {
  const { open } = args;

  return (
    <div style={{ height: "200px", position: "relative", padding: "20px" }}>
      <DropDown
        {...args}
        open={open}
        isDefaultMode={false}
        clickOutsideAction={() => {}}
        style={{ top: "20px" }}
      >
        <DropDownItem isHeader label="Category 1" />

        <DropDownItem label="Button 1" onClick={() => {}} />
        <DropDownItem label="Button 2" onClick={() => {}} />
        <DropDownItem label="Button 3" onClick={() => {}} />
        <DropDownItem label="Button 4" onClick={() => {}} disabled />
        <DropDownItem isSeparator />
        <DropDownItem label="Button 5" onClick={() => {}} />
        <DropDownItem label="Button 6" onClick={() => {}} />
      </DropDown>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    open: true,
  },
};
