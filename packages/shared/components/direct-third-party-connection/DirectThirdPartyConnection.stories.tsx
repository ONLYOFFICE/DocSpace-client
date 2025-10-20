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

import { ButtonSize } from "../button";

import DirectThirdPartyConnection from "./DirectThirdPartyConnection";
import {
  createGetFolderHandler,
  createGetFolderInfoHandler,
} from "../../__mocks__/storybook/handlers/files/folders";

import {
  mockAccounts,
  mockConnectedAccount,
  mockProviders,
  mockFilesSelectorSettings,
} from "./mockData";

const meta: Meta<typeof DirectThirdPartyConnection> = {
  title: "Components/DirectThirdPartyConnection",
  component: DirectThirdPartyConnection,
  parameters: {
    docs: {
      description: {
        component:
          "DirectThirdPartyConnection component for connecting to third-party services",
      },
    },
  },
  argTypes: {
    buttonSize: {
      control: "select",
      options: [ButtonSize.medium, ButtonSize.normal, ButtonSize.small],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DirectThirdPartyConnection>;

const accountWithProviderLink = {
  ...mockAccounts[0],
  provider_link: "https://example.com/oauth",
};

const baseArgs = {
  openConnectWindow: async () => window,
  connectDialogVisible: false,
  deleteThirdPartyDialogVisible: false,
  setConnectDialogVisible: () => {},
  setDeleteThirdPartyDialogVisible: () => {},
  clearLocalStorage: () => {},
  setSelectedThirdPartyAccount: () => {},
  setThirdPartyAccountsInfo: async () => {},
  deleteThirdParty: async () => {},
  setConnectedThirdPartyAccount: () => {},
  setThirdPartyProviders: () => {},
  providers: mockProviders,
  removeItem: mockAccounts[1],
  newPath: "/",
  basePath: "/",
  isErrorPath: false,
  filesSelectorSettings: mockFilesSelectorSettings,
  setBasePath: () => {},
  toDefault: () => {},
  setNewPath: () => {},
  accounts: mockAccounts,
  buttonSize: ButtonSize.normal,
  onSelectFolder: () => {},
  onSelectFile: () => {},
};

export const Default: Story = {
  args: {
    ...baseArgs,
    isTheSameThirdPartyAccount: false,
    selectedThirdPartyAccount: accountWithProviderLink,
    connectedThirdPartyAccount: null,
  },
};

export const Connected: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: mockConnectedAccount,
    selectedThirdPartyAccount: mockAccounts[2],
    isTheSameThirdPartyAccount: true,
  },
  parameters: {
    msw: {
      handlers: [createGetFolderInfoHandler(), createGetFolderHandler()],
    },
  },
};

export const WithError: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: mockConnectedAccount,
    selectedThirdPartyAccount: mockAccounts[0],
    isTheSameThirdPartyAccount: true,
    isError: true,
    isErrorPath: true,
  },
  parameters: {
    msw: {
      handlers: [createGetFolderInfoHandler(), createGetFolderHandler()],
    },
  },
};

export const Disabled: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: mockConnectedAccount,
    selectedThirdPartyAccount: mockAccounts[0],
    isTheSameThirdPartyAccount: true,
    isDisabled: true,
  },
  parameters: {
    msw: {
      handlers: [createGetFolderInfoHandler(), createGetFolderHandler()],
    },
  },
};
