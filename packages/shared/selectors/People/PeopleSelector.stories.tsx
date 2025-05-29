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

import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import styled from "styled-components";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmptyScreenFilter from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";

import { EmployeeStatus, EmployeeType, ShareAccessRights } from "../../enums";
import { AvatarRole } from "../../components/avatar";
import { SelectorAccessRightsMode } from "../../components/selector";
import { TSelectorItem } from "../../components/selector/Selector.types";

import { createGetPeopleHandler } from "../../__mocks__/storybook/handlers/people/getPeople";

import PeopleSelector from "./index";

const StyledRowLoader = styled.div`
  width: 100%;
  height: 48px;
`;

const StyledSearchLoader = styled.div`
  width: 100%;
  height: 32px;
`;

const meta = {
  title: "Components/Selectors/PeopleSelector",
  component: PeopleSelector,
  argTypes: {
    withHeader: { control: "boolean" },
    withSearch: { control: "boolean" },
    isMultiSelect: { control: "boolean" },
    withCancelButton: { control: "boolean" },
    withAccessRights: { control: "boolean" },
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
} satisfies Meta<typeof PeopleSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    "aria-label": "User John Smith",
    "data-user-id": "user-1",
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
    "aria-label": "User Sarah Johnson",
    "data-user-id": "user-2",
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
    "aria-label": "User Michael Brown",
    "data-user-id": "user-3",
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
    "aria-label": "User Emily Davis",
    "data-user-id": "user-4",
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
    "aria-label": "User David Wilson",
    "data-user-id": "user-5",
  },
];

// Create groups
const groups: TSelectorItem[] = [
  {
    id: "group-1",
    key: "group-1",
    label: "Marketing Team",
    name: "Marketing Team",
    isGroup: true,
    "aria-label": "Group Marketing Team",
    "data-group-id": "group-1",
  },
  {
    id: "group-2",
    key: "group-2",
    label: "Development Team",
    name: "Development Team",
    isGroup: true,
    "aria-label": "Group Development Team",
    "data-group-id": "group-2",
  },
  {
    id: "group-3",
    key: "group-3",
    label: "Design Team",
    name: "Design Team",
    isGroup: true,
    "aria-label": "Group Design Team",
    "data-group-id": "group-3",
  },
  {
    id: "group-4",
    key: "group-4",
    label: "Sales Department",
    name: "Sales Department",
    isGroup: true,
    "aria-label": "Group Sales Department",
    "data-group-id": "group-4",
  },
];

// Create access rights
const accessRights = [
  {
    id: ShareAccessRights.FullAccess,
    key: "fullAccess",
    label: "Full Access",
    description: "Can view, edit, and share",
  },
  {
    id: ShareAccessRights.ReadWrite,
    key: "readWrite",
    label: "Read & Write",
    description: "Can view and edit",
  },
  {
    id: ShareAccessRights.Read,
    key: "readOnly",
    label: "Read Only",
    description: "Can only view",
  },
  {
    id: ShareAccessRights.Restrict,
    key: "restricted",
    label: "Restricted",
    description: "No access",
  },
];

const selectedUsers = [users[0], users[2]];

const Template = (args) => {
  const rowLoader = <StyledRowLoader />;
  const searchLoader = <StyledSearchLoader />;

  const [rendItems, setRendItems] = React.useState(users);

  const loadNextPage = React.useCallback(async (index: number) => {
    setRendItems((val) => [...val, ...items.slice(index, index + 100)]);
  }, []);

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
        items={rendItems}
        renderCustomItem={rendItems[0]}
        loadNextPage={loadNextPage}
        rowLoader={rowLoader}
        searchLoader={searchLoader}
        emptyScreenImage={EmptyScreenPersonsSvgUrl}
        emptyScreenHeader="No users found"
        emptyScreenDescription="Try changing your search or filter criteria"
        searchEmptyScreenImage={EmptyScreenFilter}
        searchEmptyScreenHeader="No results found"
        searchEmptyScreenDescription="Try changing your search query"
        aria-label="People selector"
        data-selector-type="people"
        data-test-id="people-selector"
        isLoading={false}
        isSearchLoading={false}
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
    items: users,
    withHeader: true,
    headerProps: {
      headerLabel: "Select People",
      onCloseClick: () => {},
    },
    withSearch: false,
    onSearch: () => {},
    onClearSearch: () => {},
    onSubmit: () => {},
    searchPlaceholder: "Search users",
    isMultiSelect: false,
    submitButtonLabel: "Select",
    onBackClick: () => {},
    searchPlaceholder: "Search",
    searchValue: "",

    onSelect: () => {},
    selectedItems: selectedUsers,
    acceptButtonLabel: "Add",
    onAccept: () => {},
    withSelectAll: false,
    selectAllLabel: "All accounts",

    onSelectAll: () => {},
    withAccessRights: false,
    accessRights,
    selectedAccessRight: accessRights[1],
    onAccessRightsChange: () => {},
    withCancelButton: false,
    cancelButtonLabel: "Cancel",
    onCancel: () => {},
    emptyScreenImage: EmptyScreenFilter,
    emptyScreenHeader: "No other accounts here yet",
    emptyScreenDescription:
      "The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    searchEmptyScreenImage: EmptyScreenFilter,
    searchEmptyScreenHeader: "No other accounts here yet search",
    searchEmptyScreenDescription:
      " SEARCH !!! The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    totalItems: users.length,
    hasNextPage: false,
    isNextPageLoading: false,
    isLoading: false,
    withoutBackButton: false,
    alwaysShowFooter: false,
    disableAcceptButton: false,
    descriptionText: "",
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
    selectedItems: selectedUsers,
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
    accessRightsMode: SelectorAccessRightsMode.Dropdown,
  },
};

export const WithCancelButton: Story = {
  render: (args) => <Template {...args} />,
  parameters: {
    msw: {
      handlers: [createGetPeopleHandler()],
    },
  },
  args: {
    ...Default.args,
    withCancelButton: true,
    cancelButtonLabel: "Cancel",
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
    isChecked: false,
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
    disableInvitedUsers: [users[1].id, users[3].id],
  },
};
