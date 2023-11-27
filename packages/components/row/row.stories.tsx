import React from "react";
import Row from ".";
import Text from "../text";
import Avatar from "../avatar";
import ComboBox from "../combobox";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.fold... Remove this comment to see the full error message
import CatalogFolderReactSvg from "PUBLIC_DIR/images/catalog.folder.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/check.react.... Remove this comment to see the full error message
import CheckReactSvgUrl from "PUBLIC_DIR/images/check.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/item.active.... Remove this comment to see the full error message
import ItemActiveReactSvgUrl from "PUBLIC_DIR/images/item.active.react.svg?url";

export default {
  title: "Components/Row",
  component: Row,
  parameters: {
    docs: { description: { component: "Displays content as row" } },
  },
  argTypes: {
    element: {
      control: {
        type: "select",
        options: ["", "Avatar", "Icon", "ComboBox"],
      },
    },
    content: { control: "text", description: "Displays the row content" },
    contextButton: {
      description: "Enables displaying the submenu",
    },
    onSelectComboBox: { action: "onSelectComboBox", table: { disable: true } },
    contextItemClick: { action: "contextItemClick", table: { disable: true } },
    checkbox: { description: "Disable checkbox" },
  },
};

const elementAvatar = <Avatar size="min" role="user" userName="Demo Avatar" />;
const elementIcon = <CatalogFolderReactSvg size="big" />;

const renderElementComboBox = (onSelect: any) => <ComboBox
  // @ts-expect-error TS(2322): Type '{ options: { key: number; icon: any; label: ... Remove this comment to see the full error message
  options={[
    {
      key: 1,
      icon: ItemActiveReactSvgUrl,
      label: "Open",
    },
    { key: 2, icon: CheckReactSvgUrl, label: "Closed" },
  ]}
  onSelect={(option: any) => onSelect(option)}
  selectedOption={{
    key: 0,
    icon: ItemActiveReactSvgUrl,
    label: "",
  }}
  scaled={false}
  size="content"
  isDisabled={false}
/>;

const Template = ({
  element,
  contextButton,
  content,
  onSelectComboBox,
  contextItemClick,
  checkbox,
  checked,
  ...args
}: any) => {
  const getElementProps = (element: any) => element === "Avatar"
    ? { element: elementAvatar }
    : element === "Icon"
    ? { element: elementIcon }
    : element === "ComboBox"
    ? { element: renderElementComboBox(onSelectComboBox) }
    : {};

  const elementProps = getElementProps(element);
  const checkedProps = checkbox ? { checked: checked } : {};
  return (
    <Row
      {...args}
      key="1"
      style={{ width: "20%" }}
      {...checkedProps}
      {...elementProps}
      contextOptions={
        contextButton
          ? [
              {
                key: "key1",
                label: "Edit",
                onClick: () => contextItemClick("Context action: Edit"),
              },
              {
                key: "key2",
                label: "Delete",
                onClick: () => contextItemClick("Context action: Delete"),
              },
            ]
          : []
      }
    >
      // @ts-expect-error TS(2322): Type '{ children: any; truncate: true; }' is not a... Remove this comment to see the full error message
      <Text truncate={true}>{content}</Text>
    </Row>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ element... Remove this comment to see the full error message
Default.args = {
  contextButton: true,
  checked: true,
  element: "",
  content: "Sample text",
  checkbox: true,
};
