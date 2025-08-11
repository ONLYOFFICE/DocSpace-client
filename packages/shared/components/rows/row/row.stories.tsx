// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvg from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg";
import CheckReactSvgUrl from "PUBLIC_DIR/images/check.react.svg?url";
import { IconSizeType } from "../../../utils";

import { Text } from "../../text";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { ComboBox, ComboBoxSize, TOption } from "../../combobox";

import { Row } from ".";
import { RowProps } from "./Row.types";
import styles from "./row.stories.module.scss";

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

const elementAvatar = (
  <Avatar
    size={AvatarSize.min}
    role={AvatarRole.user}
    source=""
    userName="Demo Avatar"
  />
);
const elementIcon = (
  <CatalogFolderReactSvg
    className={styles.catalogFolderIcon}
    data-size={IconSizeType.big}
  />
);

const renderElementComboBox = (onSelect?: (option?: TOption) => void) => (
  <ComboBox
    options={[
      {
        key: 1,
        label: "Open",
      },
      { key: 2, icon: CheckReactSvgUrl, label: "Closed" },
    ]}
    onSelect={(option?: TOption) => {
      onSelect?.(option);
    }}
    selectedOption={{
      key: 0,
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
    isIndexEditingMode: false,
  },
  render: (args) => <Template {...args} />,
};
