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

import { Meta, StoryObj } from "@storybook/react";

import { EmployeeStatus, EmployeeType, ShareAccessRights } from "../../enums";
import { AvatarRole } from "../../components/avatar";
import { SelectorAccessRightsMode } from "../../components/selector";
import { TSelectorItem } from "../../components/selector/Selector.types";

import { createGetPeopleHandler } from "../../__mocks__/storybook/handlers/people/getPeople";

import PeopleSelector from "./index";
import type { PeopleSelectorProps } from "./PeopleSelector.types";

const meta = {
  title: "Components/Selectors/PeopleSelector",
  component: PeopleSelector,
  argTypes: {
    isMultiSelect: { control: "boolean" },
    withCancelButton: { control: "boolean" },
    withFooterCheckbox: { control: "boolean" },
    withInfo: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: "PeopleSelector component for selecting users and groups",
      },
    },
  },
} as Meta<typeof PeopleSelector>;

export default meta;

type Story = StoryObj<typeof PeopleSelector>;

// Create users with real names and emails
const users: TSelectorItem[] = [
  {
    id: "user-1",
    key: "user-1",
    label: "John Smith",
    email: "john.smith@example.com",
    isOwner: true,
    isAdmin: true,
    isVisitor: false,
    isCollaborator: false,
    isRoomAdmin: true,
    avatar: "",
    role: AvatarRole.admin,
    hasAvatar: false,
    userType: EmployeeType.Admin,
    status: EmployeeStatus.Active,
  },
  {
    id: "user-2",
    key: "user-2",
    label: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    isOwner: false,
    isAdmin: false,
    isVisitor: false,
    isCollaborator: true,
    isRoomAdmin: false,
    avatar: "",
    role: AvatarRole.collaborator,
    hasAvatar: false,
    userType: EmployeeType.User,
    status: EmployeeStatus.Active,
  },
  {
    id: "user-3",
    key: "user-3",
    label: "Michael Brown",
    email: "michael.brown@example.com",
    isOwner: false,
    isAdmin: false,
    isVisitor: false,
    isCollaborator: true,
    isRoomAdmin: false,
    avatar: "",
    role: AvatarRole.collaborator,
    hasAvatar: false,
    userType: EmployeeType.User,
    status: EmployeeStatus.Active,
  },
  {
    id: "user-4",
    key: "user-4",
    label: "Emily Davis",
    email: "emily.davis@example.com",
    isOwner: false,
    isAdmin: false,
    isVisitor: true,
    isCollaborator: false,
    isRoomAdmin: false,
    avatar: "",
    role: AvatarRole.guest,
    hasAvatar: false,
    userType: EmployeeType.Guest,
    status: EmployeeStatus.Active,
  },
  {
    id: "user-5",
    key: "user-5",
    label: "David Wilson",
    email: "david.wilson@example.com",
    isOwner: false,
    isAdmin: true,
    isVisitor: false,
    isCollaborator: false,
    isRoomAdmin: true,
    avatar: "",
    role: AvatarRole.admin,
    hasAvatar: false,
    userType: EmployeeType.Admin,
    status: EmployeeStatus.Active,
  },
];

// Create access rights
const accessRights = [
  {
    id: ShareAccessRights.FullAccess,
    key: "fullAccess",
    label: "Full Access",
    description: "Can view, edit, and share",
    access: ShareAccessRights.FullAccess,
  },
  {
    id: ShareAccessRights.ReadOnly,
    key: "readWrite",
    label: "Read & Write",
    description: "Can view and edit",
    access: ShareAccessRights.ReadOnly,
  },
  {
    id: ShareAccessRights.ReadOnly,
    key: "readOnly",
    label: "Read Only",
    description: "Can only view",
    access: ShareAccessRights.ReadOnly,
  },
  {
    id: ShareAccessRights.Editing,
    key: "restricted",
    label: "Restricted",
    description: "No access",
    access: ShareAccessRights.Editing,
  },
];

const Template = (args: PeopleSelectorProps) => {
  return (
    <div
      style={{
        width: "480px",
        height: "485px",
        margin: "auto",
      }}
    >
      <PeopleSelector
        {...args}
        aria-label="People selector"
        data-selector-type="people"
        data-test-id="people-selector"
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    headerProps: {
      headerLabel: "Select People",
      onCloseClick: () => {},
    },
    onSubmit: () => {},
    isMultiSelect: false,
    submitButtonLabel: "Select",

    accessRights,
    selectedAccessRight: accessRights[1],
    onAccessRightsChange: () => {},
    withCancelButton: true,
    cancelButtonLabel: "Cancel",
    onCancel: () => {},
    disableSubmitButton: false,
  },
};

export const WithMultiSelect: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    ...Default.args,
    isMultiSelect: true,
  },
};

export const WithAccessRights: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    ...Default.args,
    withAccessRights: true,
    isMultiSelect: true,
    accessRights,
    selectedAccessRight: accessRights[1],
    accessRightsMode: SelectorAccessRightsMode.Detailed,
    onAccessRightsChange: () => {},
  },
};

export const WithFooterCheckbox: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    ...Default.args,
    withFooterCheckbox: true,
    footerCheckboxLabel: "Notify users",
    isChecked: true,
  },
};

export const WithInfo: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    ...Default.args,
    withInfo: true,
    infoText: "Select users to collaborate with",
  },
};

export const WithDisabledUsers: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    ...Default.args,
    disableInvitedUsers: [String(users[1].id), String(users[3].id)],
  },
};
