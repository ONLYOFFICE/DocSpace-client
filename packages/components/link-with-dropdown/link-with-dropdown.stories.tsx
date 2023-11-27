import React from "react";
import LinkWithDropdown from ".";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/settings.rea... Remove this comment to see the full error message
import SettingsReactSvg from "PUBLIC_DIR/images/settings.react.svg?url";

export default {
  title: "Components/LinkWithDropdown",
  component: LinkWithDropdown,
  parameters: { docs: { description: { component: "Link with dropdown" } } },
  argTypes: {
    color: { control: "color" },
    dropdownType: { required: false },
    linkLabel: { control: "text", description: "Link text" },
    onItemClick: { action: "Button action", table: { disable: true } },
  },
};

const Template = ({
  linkLabel,
  onItemClick,
  ...args
}: any) => {
  const dropdownItems = [
    {
      key: "key1",
      label: "Button 1",
      onClick: () => onItemClick("Button1 action"),
    },
    {
      key: "key2",
      label: "Button 2",
      onClick: () => onItemClick("Button2 action"),
    },
    {
      key: "key3",
      isSeparator: true,
    },
    {
      key: "key4",
      label: "Button 3",
      onClick: () => onItemClick("Button3 action"),
    },
  ];
  return (
    <LinkWithDropdown {...args} data={dropdownItems}>
      {linkLabel}
    </LinkWithDropdown>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ linkLab... Remove this comment to see the full error message
Default.args = {
  // dropdownType: "alwaysDashed",
  fontSize: "13px",
  fontWeight: "400",
  isBold: false,
  isTextOverflow: false,
  isSemitransparent: false,
  linkLabel: "Some text",
};
