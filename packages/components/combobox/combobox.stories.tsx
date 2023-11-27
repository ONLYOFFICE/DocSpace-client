import React from "react";

import ComboBox from "./";
import RadioButton from "../radio-button";
import DropDownItem from "../drop-down-item";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/nav.logo.ope... Remove this comment to see the full error message
import NavLogoIcon from "PUBLIC_DIR/images/nav.logo.opened.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.empl... Remove this comment to see the full error message
import CatalogEmployeeReactSvgUrl from "PUBLIC_DIR/images/catalog.employee.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.gues... Remove this comment to see the full error message
import CatalogGuestReactSvgUrl from "PUBLIC_DIR/images/catalog.guest.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/copy.react.s... Remove this comment to see the full error message
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

// @ts-expect-error TS(2307): Cannot find module './combobox-docs..mdx' or its c... Remove this comment to see the full error message
import ComboBoxDocs from "./combobox-docs..mdx";

export default {
  title: "Components/ComboBox",
  component: ComboBox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: ComboBoxDocs,
    },
  },
};

const comboOptions = [
  {
    key: 1,
    icon: CatalogEmployeeReactSvgUrl,
    label: "Option 1",
  },
  {
    key: 2,
    icon: CatalogGuestReactSvgUrl,
    label: "Option 2",
  },
  {
    key: 3,
    disabled: true,
    label: "Option 3",
  },
  {
    key: 4,
    label: "Option 4",
  },
  {
    key: 5,
    icon: CopyReactSvgUrl,
    label: "Option 5",
  },
  {
    key: 6,
    label: "Option 6",
  },
  {
    key: 7,
    label: "Option 7",
  },
];

let children: any = [];

const advancedOptions = (
  <>
    <DropDownItem key="1" noHover>
      // @ts-expect-error TS(2322): Type '{ value: string; name: string; label: string... Remove this comment to see the full error message
      <RadioButton value="asc" name="first" label="A-Z" isChecked={true} />
    </DropDownItem>
    <DropDownItem key="2" noHover>
      // @ts-expect-error TS(2322): Type '{ value: string; name: string; label: string... Remove this comment to see the full error message
      <RadioButton value="desc" name="first" label="Z-A" />
    </DropDownItem>
    <DropDownItem key="3" isSeparator />
    <DropDownItem key="4" noHover>
      // @ts-expect-error TS(2322): Type '{ value: string; name: string; label: string... Remove this comment to see the full error message
      <RadioButton value="first" name="second" label="First name" />
    </DropDownItem>
    <DropDownItem key="5" noHover>
      <RadioButton
        // @ts-expect-error TS(2322): Type '{ value: string; name: string; label: string... Remove this comment to see the full error message
        value="last"
        name="second"
        label="Last name"
        isChecked={true}
      />
    </DropDownItem>
  </>
);

const Wrapper = (props: any) => <div style={{ height: "220px" }}>{props.children}</div>;

const childrenItems = children.length > 0 ? children : null;

const BadgeTypeTemplate = (args: any) => <Wrapper>
  <ComboBox
    {...args}
    fixedDirection={true}
    isDefaultMode={false}
    options={[
      { key: 1, label: "Open", backgroundColor: "#4781D1", color: "#FFFFFF" },
      { key: 2, label: "Done", backgroundColor: "#444", color: "#FFFFFF" },
      {
        key: 3,
        label: "2nd turn",
        backgroundColor: "#FFFFFF",
        color: "#555F65",
        border: "#4781D1",
      },
      {
        key: 4,
        label: "3rd turn",
        backgroundColor: "#FFFFFF",
        color: "#555F65",
        border: "#4781D1",
      },
    ]}
    selectedOption={{
      key: 0,
      label: "Select",
    }}
  />
</Wrapper>;
const Template = (args: any) => <Wrapper>
  <ComboBox
    {...args}
    isDefaultMode={false}
    fixedDirection={true}
    directionY="both"
    options={[
      { key: 1, label: "Option 1" },
      { key: 2, label: "Option 2" },
    ]}
    selectedOption={{
      key: 0,
      label: "Select",
    }}
  />
</Wrapper>;

const BaseOptionsTemplate = (args: any) => <Wrapper>
  <ComboBox
    {...args}
    isDefaultMode={false}
    directionY="both"
    fixedDirection={true}
    options={comboOptions}
    onSelect={(option: any) => args.onSelect(option)}
    selectedOption={{
      key: 0,
      label: "Select",
      default: true,
    }}
  >
    {childrenItems}
  </ComboBox>
</Wrapper>;

const AdvancedOptionsTemplate = (args: any) => <Wrapper>
  <ComboBox
    {...args}
    isDefaultMode={false}
    fixedDirection={true}
    directionY="both"
    options={[]}
    advancedOptions={advancedOptions}
    onSelect={(option: any) => args.onSelect(option)}
    selectedOption={{
      key: 0,
      label: "Select",
      default: true,
    }}
  >
    <NavLogoIcon size="medium" key="comboIcon" />
  </ComboBox>
</Wrapper>;

export const basic = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
basic.args = {
  scaled: false,
};
export const baseOption = BaseOptionsTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
baseOption.args = {
  scaledOptions: false,
  scaled: false,
  noBorder: false,
  isDisabled: false,
};
export const advancedOption = AdvancedOptionsTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
advancedOption.args = {
  isDisabled: false,
  scaled: false,
  size: "content",
  directionX: "right",
  directionY: "bottom",
};

export const badgeType = BadgeTypeTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
badgeType.args = {
  scaled: false,
  type: "badge",
  size: "content",
  scaledOptions: true,
};
