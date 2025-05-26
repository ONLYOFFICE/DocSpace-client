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
import { action } from "@storybook/addon-actions";
import { AccountsSearchArea, EmployeeStatus, EmployeeType, ShareAccessRights } from "../../enums";

import PeopleSelector from "./index";
import { SelectorAccessRightsMode } from "../../components/selector";

// Mock API calls for Storybook
jest.mock("../../api/people", () => ({
  getUserList: jest.fn().mockResolvedValue({
    items: [
      {
        id: "user1",
        displayName: "John Doe",
        email: "john@example.com",
        avatar: "",
        hasAvatar: false,
        isOwner: false,
        isAdmin: false,
        isVisitor: false,
        isCollaborator: true,
        isRoomAdmin: false,
        status: EmployeeStatus.Active,
        userType: EmployeeType.Collaborator,
        shared: false,
        groups: [],
      },
      {
        id: "user2",
        displayName: "Jane Smith",
        email: "jane@example.com",
        avatar: "",
        hasAvatar: false,
        isOwner: false,
        isAdmin: true,
        isVisitor: false,
        isCollaborator: false,
        isRoomAdmin: false,
        status: EmployeeStatus.Active,
        userType: EmployeeType.Admin,
        shared: false,
        groups: [],
      },
      {
        id: "user3",
        displayName: "Bob Johnson",
        email: "bob@example.com",
        avatar: "",
        hasAvatar: false,
        isOwner: false,
        isAdmin: false,
        isVisitor: true,
        isCollaborator: false,
        isRoomAdmin: false,
        status: EmployeeStatus.Active,
        userType: EmployeeType.Guest,
        shared: false,
        groups: [],
      },
    ],
    total: 3,
  }),
  getMembersList: jest.fn().mockResolvedValue({
    items: [
      {
        id: "group1",
        name: "Marketing",
        manager: "user1",
      },
      {
        id: "group2",
        name: "Development",
        manager: "user2",
      },
    ],
    total: 2,
  }),
}));

const meta: Meta<typeof PeopleSelector> = {
  title: "Components/Selectors/PeopleSelector",
  component: PeopleSelector,
  parameters: {
    docs: {
      description: {
        component: "PeopleSelector component for selecting users and groups",
      },
    },
  },
  argTypes: {
    withHeader: {
      control: "boolean",
      description: "Show header",
      defaultValue: true,
    },
    withSearch: {
      control: "boolean",
      description: "Show search",
      defaultValue: true,
    },
    isMultiSelect: {
      control: "boolean",
      description: "Allow multiple selection",
      defaultValue: false,
    },
    withGroups: {
      control: "boolean",
      description: "Include groups tab",
      defaultValue: false,
    },
    withGuests: {
      control: "boolean",
      description: "Include guests tab",
      defaultValue: false,
    },
    withCancelButton: {
      control: "boolean",
      description: "Show cancel button",
      defaultValue: false,
    },
    withAccessRights: {
      control: "boolean",
      description: "Show access rights selector",
      defaultValue: false,
    },
  },
  args: {
    withHeader: true,
    headerProps: {
      headerLabel: "Select People",
      onCloseClick: action("onCloseClick"),
    },
    withSearch: true,
    searchPlaceholder: "Search users",
    onSearch: action("onSearch"),
    onClearSearch: action("onClearSearch"),
    isMultiSelect: false,
    submitButtonLabel: "Select",
    onSubmit: action("onSubmit"),
  },
};

export default meta;
type Story = StoryObj<typeof PeopleSelector>;

export const Default: Story = {
  args: {},
};

export const WithMultiSelect: Story = {
  args: {
    isMultiSelect: true,
  },
};

export const WithGroups: Story = {
  args: {
    withGroups: true,
  },
};

export const WithGuests: Story = {
  args: {
    withGuests: true,
  },
};

export const WithAccessRights: Story = {
  args: {
    withAccessRights: true,
    isMultiSelect: true,
    accessRights: [
      {
        id: ShareAccessRights.FullAccess,
        label: "Full Access",
        description: "Can view, edit and share",
      },
      {
        id: ShareAccessRights.ReadWrite,
        label: "Read & Write",
        description: "Can view and edit",
      },
      {
        id: ShareAccessRights.Read,
        label: "Read Only",
        description: "Can only view",
      },
      {
        id: ShareAccessRights.Restrict,
        label: "Restrict Access",
        description: "No access",
      },
    ],
    selectedAccessRight: ShareAccessRights.Read,
    onAccessRightsChange: action("onAccessRightsChange"),
    accessRightsMode: SelectorAccessRightsMode.Detailed,
  },
};

export const WithCancelButton: Story = {
  args: {
    withCancelButton: true,
    cancelButtonLabel: "Cancel",
    onCancel: action("onCancel"),
  },
};

export const WithDisabledUsers: Story = {
  args: {
    disableInvitedUsers: ["user1"],
  },
};

export const GroupsOnly: Story = {
  args: {
    withGroups: true,
    isGroupsOnly: true,
  },
};

export const GuestsOnly: Story = {
  args: {
    withGuests: true,
    isGuestsOnly: true,
  },
};
