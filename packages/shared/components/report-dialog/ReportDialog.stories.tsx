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
import { action } from "@storybook/addon-actions";
import ReportDialog from ".";
import { Button } from "../button";
import { DeviceType } from "../../enums";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";
import type { ReportDialogProps } from "./ReportDialog.types";
import FirebaseHelper from "../../utils/firebase";

const meta: Meta<typeof ReportDialog> = {
  title: "Dialogs/ReportDialog",
  component: ReportDialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A dialog component for displaying and submitting error reports.",
      },
    },
  },
  argTypes: {
    onClose: { action: "closed" },
    visible: { control: "boolean" },
    error: { control: "object" },
    user: { control: "object" },
    version: { control: "text" },
    firebaseHelper: { control: "object" },
    currentDeviceType: {
      control: "select",
      options: Object.values(DeviceType),
    },
  },
  decorators: [i18nextStoryDecorator],
};

export default meta;
type Story = StoryObj<typeof ReportDialog>;

const mockUser = {
  id: "user-1",
  email: "user@example.com",
  displayName: "Test User",
  access: 0,
  firstName: "Test",
  lastName: "User",
  userName: "testuser",
  status: 1, // Assuming this is EmployeeStatus
  activationStatus: 1, // Assuming this is EmployeeActivationStatus
  department: "",
  workFrom: "",
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
  isCollaborator: true,
  mobilePhoneActivationStatus: 0,
  isSSO: false,
  avatarSmall: "",
  profileUrl: "",
  hasAvatar: false,
  isAnonim: false,
};

const mockError = new Error("Test error message");

const mockFirebaseHelper = {
  sendCrashReport: async () => {
    action("sendCrashReport")();
    return true;
  },
};

type DialogWithToggleButtonProps = Omit<
  ReportDialogProps,
  "visible" | "onClose"
>;

const DialogWithToggleButton = ({ ...args }: DialogWithToggleButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const handleClose = () => {
    setIsVisible(false);
    action("onClose")();
  };

  return (
    <div>
      <Button
        label={isVisible ? "Close Dialog" : "Open Dialog"}
        onClick={() => setIsVisible(!isVisible)}
        style={{ marginBottom: "20px" }}
      />
      <ReportDialog {...args} visible={isVisible} onClose={handleClose} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <DialogWithToggleButton {...args} />,
  args: {
    error: mockError,
    user: mockUser,
    version: "1.0.0",
    firebaseHelper: mockFirebaseHelper as unknown as FirebaseHelper,
    currentDeviceType: DeviceType.desktop,
  },
};
