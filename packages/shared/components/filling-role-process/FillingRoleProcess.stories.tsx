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

import FillingRoleProcess from "./FillingRoleProcess";
import { FileFillingFormStatus, FillingFormStatusHistory } from "../../enums";

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

const createMockUser = (id: string, displayName: string) => ({
  id,
  displayName,
  access: 0,
  firstName: displayName.split(" ")[0],
  lastName: displayName.split(" ")[1] || "",
  userName: displayName.toLowerCase().replace(/\s+/g, "."),
  email: `${displayName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  status: 1, // EmployeeStatus.Active
  activationStatus: 1, // EmployeeActivationStatus.Activated
  department: "Development",
  workFrom: "2023-01-01T10:00:00Z",
  avatarMax: "",
  avatarMedium: "",
  avatarOriginal: "",
  avatar: "",
  isAdmin: false,
  isRoomAdmin: false,
  isLDAP: false,
  listAdminModules: [],
  isOwner: false,
  isVisitor: false,
  isCollaborator: false,
  isAnonim: false,
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  avatarSmall: "",
  profileUrl: "",
  hasAvatar: false,
  groups: [],
  mobilePhone: "",
  title: "",
});

const mockProcessDetails = [
  {
    sequence: 1,
    user: createMockUser("user1", "John Doe"),
    roleName: "Approver",
    roleStatus: FileFillingFormStatus.None,
    roleColor: "#FF9500",
    submitted: false,
    history: {
      [FillingFormStatusHistory.OpenedAtDate]: "2023-01-01T10:00:00Z",
      [FillingFormStatusHistory.SubmissionDate]: "2023-01-02T11:30:00Z",
      [FillingFormStatusHistory.StopDate]: "2023-01-02T11:30:00Z",
    } as const,
  },
  {
    sequence: 2,
    user: createMockUser("user2", "Jane Smith"),
    roleName: "Reviewer",
    roleStatus: FileFillingFormStatus.Completed,
    roleColor: "#2AB0FC",
    submitted: true,
    history: {
      [FillingFormStatusHistory.OpenedAtDate]: "2023-01-03T09:15:00Z",
      [FillingFormStatusHistory.SubmissionDate]: "2023-01-02T11:30:00Z",
      [FillingFormStatusHistory.StopDate]: "2023-01-04T15:45:00Z",
    } as const,
  },
];

export const Default: Story = {
  args: {
    processDetails: mockProcessDetails,
    fileStatus: FileFillingFormStatus.InProgress,
    currentUserId: "user1",
  },
};

export const Completed: Story = {
  args: {
    processDetails: mockProcessDetails,
    fileStatus: FileFillingFormStatus.Completed,
    currentUserId: "user1",
  },
};

export const Stopped: Story = {
  args: {
    processDetails: mockProcessDetails,
    fileStatus: FileFillingFormStatus.Stopped,
    currentUserId: "user1",
  },
};
