import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvg from "PUBLIC_DIR/images/catalog.folder.react.svg";
import CheckReactSvgUrl from "PUBLIC_DIR/images/check.react.svg?url";
import ItemActiveReactSvgUrl from "PUBLIC_DIR/images/item.active.react.svg?url";
import { IconSizeType, commonIconsStyles } from "../../utils";

import { Text } from "../text";
import { Avatar, AvatarRole, AvatarSize } from "../avatar";
import { ComboBox, ComboBoxSize, TOption } from "../combobox";

import { Row } from "./Row";
import { RowProps } from "./Row.types";

const meta = {
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
    // content: { control: "text", description: "Displays the row content" },
    // contextButton: {
    //   description: "Enables displaying the submenu",
    // },
    // onSelectComboBox: { action: "onSelectComboBox", table: { disable: true } },
    // contextItemClick: { action: "contextItemClick", table: { disable: true } },
    // checkbox: { description: "Disable checkbox" },
  },
} satisfies Meta<typeof Row>;
type Story = StoryObj<typeof meta>;

export default meta;

const CatalogFolderIcon = styled(CatalogFolderReactSvg)`
  ${commonIconsStyles}
`;

const elementAvatar = (
  <Avatar
    size={AvatarSize.min}
    role={AvatarRole.user}
    source=""
    userName="Demo Avatar"
  />
);
const elementIcon = <CatalogFolderIcon size={IconSizeType.big} />;

const renderElementComboBox = (onSelect?: (option?: TOption) => void) => (
  <ComboBox
    options={[
      {
        key: 1,
        icon: ItemActiveReactSvgUrl,
        label: "Open",
      },
      { key: 2, icon: CheckReactSvgUrl, label: "Closed" },
    ]}
    onSelect={(option?: TOption) => {
      onSelect?.(option);
    }}
    selectedOption={{
      key: 0,
      icon: ItemActiveReactSvgUrl,
      label: "",
    }}
    scaled={false}
    size={ComboBoxSize.content}
    isDisabled={false}
  />
);

const Template = ({ ...args }: RowProps) => {
  const { checked } = args;
  const getElementProps = (element: string) =>
    element === "Avatar"
      ? { element: elementAvatar }
      : element === "Icon"
        ? { element: elementIcon }
        : element === "ComboBox"
          ? { element: renderElementComboBox() }
          : {};

  const elementProps = getElementProps("Avatar");
  const checkedProps = { checked };
  return (
    <Row
      {...args}
      key="1"
      style={{ width: "20%" }}
      {...checkedProps}
      {...elementProps}
      contextOptions={[
        {
          key: "key1",
          label: "Edit",
          // onClick: () => contextItemClick("Context action: Edit"),
        },
        {
          key: "key2",
          label: "Delete",
          // onClick: () => contextItemClick("Context action: Delete"),
        },
      ]}
    >
      <Text truncate>Sample text</Text>
    </Row>
  );
};

export const Default: Story = {
  args: {
    checked: true,
  },
  render: (args) => <Template {...args} />,
};
