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

import FillingRoleProcess from "./FillingRoleProcess";
import { FileFillingFormStatus, RoleStatus } from "../../enums";
import type { TUser } from "../../api/people/types";

const meta = {
  title: "Components/FillingRoleProcess",
  component: FillingRoleProcess,
  parameters: {
    docs: {
      description: {
        component:
          "Component for displaying the role filling process with avatar and role information",
      },
    },
  },
  argTypes: {
    processDetails: {
      description:
        "Array of process details for each role in the form filling process",
    },
    fileStatus: {
      description: "Current status of the form filling process",
      control: "select",
      options: Object.values(FileFillingFormStatus).filter(
        (x) => typeof x === "number",
      ),
    },
  },
} satisfies Meta<typeof FillingRoleProcess>;

export default meta;
type Story = StoryObj<typeof FillingRoleProcess>;

const mockUser: TUser = {
  id: "1",
  userName: "John Smith",
  email: "john@example.com",
  avatar: "avatar-url",
  avatarMax: "avatar-max-url",
  avatarMedium: "avatar-medium-url",
  avatarOriginal: "avatar-original-url",
  displayName: "John Smith",
  isVisitor: false,

  isCollaborator: true,
  isRoomAdmin: false,
  firstName: "John",
  lastName: "Smith",
  status: 1, // EmployeeStatus.Active
  activationStatus: 1, // EmployeeActivationStatus.Activated
  workFrom: "",
  department: "",
  isLDAP: false,
  isAdmin: false,
  listAdminModules: [],
  isOwner: false,
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  profileUrl: "",
  access: 0,
  avatarSmall: "",
  hasAvatar: false,
  isAnonim: false,
};

export const Default: Story = {
  args: {
    fileStatus: FileFillingFormStatus.InProgress,
    processDetails: [
      {
        id: "1",
        user: mockUser,
        processStatus: RoleStatus.Filled,
        roleName: "Manager",
        histories: [
          {
            id: "1",
            action: "Form sent",
            date: "2025-02-13T10:00:00Z",
          },
          {
            id: "2",
            action: "Form signed",
            date: "2025-02-13T11:00:00Z",
          },
        ],
      },
      {
        id: "2",
        user: { ...mockUser, id: "2", userName: "Alice Johnson" },
        processStatus: RoleStatus.YourTurn,
        roleName: "Reviewer",
        histories: [
          {
            id: "3",
            action: "Form received",
            date: "2025-02-13T11:05:00Z",
          },
        ],
      },
      {
        id: "3",
        user: { ...mockUser, id: "3", userName: "Bob Wilson" },
        processStatus: RoleStatus.Waiting,
        roleName: "Approver",
        histories: [],
      },
    ],
  },
};

export const Completed: Story = {
  args: {
    fileStatus: FileFillingFormStatus.Completed,
    processDetails: [
      {
        id: "1",
        user: mockUser,
        processStatus: RoleStatus.Filled,
        roleName: "Manager",
        histories: [
          {
            id: "1",
            action: "Form sent",
            date: "2025-02-13T10:00:00Z",
          },
          {
            id: "2",
            action: "Form signed",
            date: "2025-02-13T11:00:00Z",
          },
        ],
      },
      {
        id: "2",
        user: { ...mockUser, id: "2", userName: "Alice Johnson" },
        processStatus: RoleStatus.Filled,
        roleName: "Reviewer",
        histories: [
          {
            id: "3",
            action: "Form received",
            date: "2025-02-13T11:05:00Z",
          },
          {
            id: "4",
            action: "Form reviewed",
            date: "2025-02-13T12:00:00Z",
          },
        ],
      },
    ],
  },
};

export const Stopped: Story = {
  args: {
    fileStatus: FileFillingFormStatus.Stopped,
    processDetails: [
      {
        id: "1",
        user: mockUser,
        processStatus: RoleStatus.Filled,
        roleName: "Manager",
        histories: [
          {
            id: "1",
            action: "Form sent",
            date: "2025-02-13T10:00:00Z",
          },
          {
            id: "2",
            action: "Form signed",
            date: "2025-02-13T11:00:00Z",
          },
        ],
      },
      {
        id: "2",
        user: { ...mockUser, id: "2", userName: "Alice Johnson" },
        processStatus: RoleStatus.Stopped,
        roleName: "Reviewer",
        histories: [
          {
            id: "3",
            action: "Form received",
            date: "2025-02-13T11:05:00Z",
          },
          {
            id: "4",
            action: "Process stopped",
            date: "2025-02-13T12:00:00Z",
          },
        ],
      },
    ],
  },
};
