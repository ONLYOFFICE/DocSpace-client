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
import React from "react";
import { http, HttpResponse } from "msw";

import { ButtonSize } from "@docspace/shared/components/button";

import {
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
  mockConnectedAccount,
} from "../../../mockData";
import ThirdPartyModule from "./ThirdPartyModule";

const meta: Meta<typeof ThirdPartyModule> = {
  title: "Pages/Backup/ManualBackup/ThirdPartyModule",
  component: ThirdPartyModule,
  tags: ["!autodocs"],
  parameters: {
    docs: {
      description: {
        component: "ThirdPartyModule component for manual backup",
      },
    },
    msw: {
      handlers: [http.get("*/api/2.0/*", () => new HttpResponse(null))],
    },
  },
  argTypes: {
    onMakeCopy: { control: false },
    openConnectWindow: { control: false },
    setConnectDialogVisible: { control: false },
    setDeleteThirdPartyDialogVisible: { control: false },
    clearLocalStorage: { control: false },
    setSelectedThirdPartyAccount: { control: false },
    setThirdPartyAccountsInfo: { control: false },
    deleteThirdParty: { control: false },
    setConnectedThirdPartyAccount: { control: false },
    setThirdPartyProviders: { control: false },
    setBasePath: { control: false },
    toDefault: { control: false },
    setNewPath: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ThirdPartyModule>;

const ThirdPartyModuleWithTranslation = (
  args: React.ComponentProps<typeof ThirdPartyModule>,
) => {
  return <ThirdPartyModule {...args} />;
};

export const Default: Story = {
  render: (args) => <ThirdPartyModuleWithTranslation {...args} />,
  args: {
    isMaxProgress: true,
    buttonSize: ButtonSize.medium,
    connectedThirdPartyAccount: null,
    isTheSameThirdPartyAccount: true,
    connectDialogVisible: false,
    deleteThirdPartyDialogVisible: false,
    selectedThirdPartyAccount: mockThirdPartyAccounts[0],
    accounts: mockThirdPartyAccounts,
    providers: mockThirdPartyProviders,
    removeItem: mockThirdPartyAccounts[0],
    basePath: "/",
    newPath: "/",
    isErrorPath: false,
    filesSelectorSettings: {
      getIcon: () => {},
    },
    onMakeCopy: async () => {},
    openConnectWindow: async () => null,
    setConnectDialogVisible: () => {},
    setDeleteThirdPartyDialogVisible: () => {},
    clearLocalStorage: () => {},
    setSelectedThirdPartyAccount: () => {},
    setThirdPartyAccountsInfo: async () => {},
    deleteThirdParty: async () => {},
    setConnectedThirdPartyAccount: () => {},
    setThirdPartyProviders: () => {},
    setBasePath: () => {},
    toDefault: () => {},
    setNewPath: () => {},
  },
};

export const Connected: Story = {
  render: (args) => <ThirdPartyModuleWithTranslation {...args} />,
  args: {
    ...Default.args,
    connectedThirdPartyAccount: mockConnectedAccount,
    isTheSameThirdPartyAccount: true,
    selectedThirdPartyAccount: {
      ...mockThirdPartyAccounts[0],
      storageIsConnected: true,
      connected: true,
    },
  },
};

export const WithError: Story = {
  render: (args) => <ThirdPartyModuleWithTranslation {...args} />,
  args: {
    ...Default.args,
    connectedThirdPartyAccount: mockConnectedAccount,
    isTheSameThirdPartyAccount: true,
    selectedThirdPartyAccount: {
      ...mockThirdPartyAccounts[0],
      storageIsConnected: true,
      connected: true,
    },
    isErrorPath: true,
  },
};

export const Disabled: Story = {
  render: (args) => <ThirdPartyModuleWithTranslation {...args} />,
  args: {
    ...Default.args,
    isMaxProgress: false,
  },
};
