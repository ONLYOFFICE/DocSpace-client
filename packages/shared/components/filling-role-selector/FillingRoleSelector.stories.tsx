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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { FillingRoleSelector } from "./FillingRoleSelector";
import { FillingRoleSelectorProps } from "./FillingRoleSelector.types";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/FillingRoleSelector",
  component: FillingRoleSelector,
  argTypes: {
    onAddUser: { action: "onAddUser" },
    onRemoveUser: { action: "onRemoveUser" },
  },
} satisfies Meta<typeof FillingRoleSelector>;
type Story = StoryObj<typeof FillingRoleSelector>;

export default meta;

const mockRoles = [
  { id: "3", name: "Director", order: 3, color: globalColors.secondPurple },
  { id: "2", name: "Accountant", order: 2, color: globalColors.secondGreen },
  {
    id: "1",
    name: "Employee",
    order: 1,
    color: globalColors.favoritesStatus,
    everyone: "@Everyone",
  },
];

const mockUsers = [
  {
    id: "1",
    displayName: "Makenna Lipshutz",
    role: "Accountant",
    avatar: "/images/user.avatar.example.react.svg",
    hasAvatar: true,
  },
  {
    id: "2",
    displayName: "Randy Korsgaard",
    role: "Director",
    hasAvatar: false,
  },
];

// TODO: Fix translations to correct ones when they appear on layouts
const textRoleEveryone =
  "The form is available for filling out by all participants of this room.";
const textTooltip =
  "Each form filled out by users from the first role will go in turn to the next users listed below.";

const Template = ({ onAddUser, ...args }: FillingRoleSelectorProps) => {
  const onAddUserHandler = () => {
    onAddUser();
  };

  return (
    <FillingRoleSelector
      {...args}
      style={{ width: "480px", padding: "16px" }}
      onAddUser={onAddUserHandler}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    roles: mockRoles,
    descriptionEveryone: textRoleEveryone,
    descriptionTooltip: textTooltip,
  },
};

const TemplateRolesFilledUsers = ({
  users,
  onAddUser,
  onRemoveUser,
  ...args
}: FillingRoleSelectorProps) => {
  const [usersAssigned, setUsersAssigned] = useState(mockUsers);

  const onRemoveUserHandler = (id: string) => {
    const newUsersAssigned = usersAssigned.filter((item) => item.id !== id);
    setUsersAssigned(newUsersAssigned);
    onRemoveUser?.(id);
  };

  const onAddUserHandler = () => {
    onAddUser();
  };

  return (
    <FillingRoleSelector
      {...args}
      style={{ width: "480px", padding: "16px" }}
      users={usersAssigned}
      onRemoveUser={onRemoveUserHandler}
      onAddUser={onAddUserHandler}
    />
  );
};

export const rolesFilledUsers: Story = {
  render: (args) => <TemplateRolesFilledUsers {...args} />,
  args: {
    roles: mockRoles,
    users: mockUsers,
    descriptionEveryone: textRoleEveryone,
    descriptionTooltip: textTooltip,
  },
};
