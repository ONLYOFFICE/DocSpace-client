// (c) Copyright Ascensio System SIA 2009-2025
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

import type { Meta, StoryObj } from "@storybook/react";

import ChangeToEmployeeReactSvgUrl from "PUBLIC_DIR/images/change.to.employee.react.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";

import { TableGroupMenu } from "./TableGroupMenu";
import { TGroupMenuItem } from "../Table.types";
import { DropDownItem } from "../../drop-down-item";

const meta = {
  title: "Components/Table/TableGroupMenu",
  component: TableGroupMenu,
  parameters: {
    docs: {
      description: {
        component:
          "TableGroupMenu component for displaying group menu in tables with checkbox, combobox, and action buttons",
      },
    },
  },
  argTypes: {
    isChecked: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
    isBlocked: { control: "boolean" },
    isMobileView: { control: "boolean" },
    isInfoPanelVisible: { control: "boolean" },
    withoutInfoPanelToggler: { control: "boolean" },
    withComboBox: { control: "boolean" },
    isCloseable: { control: "boolean" },
    checkboxMargin: { control: "text" },
    headerLabel: { control: "text" },
    onChange: { control: false },
    onClick: { control: false },
    toggleInfoPanel: { control: false },
    onCloseClick: { control: false },
    headerMenu: { control: false },
    checkboxOptions: { control: false },
  },
  decorators: [
    (Story) => {
      return (
        <div style={{ height: "68px" }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof TableGroupMenu>;

export default meta;
type Story = StoryObj<typeof TableGroupMenu>;

const createMenuItems = (): TGroupMenuItem[] => [
  {
    id: "menu-change-type",
    disabled: false,
    label: "Change type",
    title: "Change type",
    iconUrl: ChangeToEmployeeReactSvgUrl,
    onClick: () => {},
    withDropDown: true,
    options: [
      {
        key: "option-1",
        label: "Option 1",
        onClick: () => {},
      },
      {
        key: "option-2",
        label: "Option 2",
        onClick: () => {},
      },
    ],
  },
  {
    id: "menu-info",
    label: "Info",
    title: "Info",
    disabled: false,
    onClick: () => {},
    iconUrl: InfoReactSvgUrl,
  },
  {
    id: "menu-invite",
    label: "Invite",
    title: "Invite",
    disabled: false,
    onClick: () => {},
    iconUrl: InviteAgainReactSvgUrl,
  },
];

const checkboxOptions = (
  <>
    <DropDownItem key="all" label="All" data-index={0} onClick={() => {}} />
    <DropDownItem
      key="active"
      label="Active"
      data-index={1}
      onClick={() => {}}
    />
  </>
);

export const Default: Story = {
  args: {
    isChecked: false,
    isIndeterminate: false,
    headerMenu: createMenuItems(),
    checkboxOptions,
    onClick: () => {},
    onChange: () => {},
    withoutInfoPanelToggler: false,
    isInfoPanelVisible: false,
    toggleInfoPanel: () => {},
    isBlocked: false,
    withComboBox: true,
  },
};

export const Checked: Story = {
  args: {
    ...Default.args,
    isChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    ...Default.args,
    isIndeterminate: true,
  },
};

export const WithoutComboBox: Story = {
  args: {
    ...Default.args,
    withComboBox: false,
  },
};

export const WithHeaderLabel: Story = {
  args: {
    ...Default.args,
    headerLabel: "Custom header label",
  },
};

export const WithInfoPanelVisible: Story = {
  args: {
    ...Default.args,
    isInfoPanelVisible: true,
  },
};

export const WithoutInfoPanelToggler: Story = {
  args: {
    ...Default.args,
    withoutInfoPanelToggler: true,
  },
};

export const Blocked: Story = {
  args: {
    ...Default.args,
    isBlocked: true,
  },
};

export const Closeable: Story = {
  args: {
    ...Default.args,
    isCloseable: true,
    onCloseClick: () => {},
  },
};

export const WithCustomCheckboxMargin: Story = {
  args: {
    ...Default.args,
    checkboxMargin: "100px",
  },
};
