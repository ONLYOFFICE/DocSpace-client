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

import {
  createGetEncryptionProgressHandler,
  createGetEncryptionHistoryHandler,
  type EncryptionHistoryItem,
} from "../../__mocks__/storybook/handlers/portal/getEncryptionProgress";

import { EncryptionPortal } from ".";

// Define constants for progress percentages
const PROGRESS = {
  ZERO: 0,
  LOW: 10,
  MEDIUM: 50,
  HIGH: 75,
  COMPLETE: 100,
};

// Mock encryption history data
const MOCK_HISTORY: EncryptionHistoryItem[] = [
  {
    id: "1",
    date: new Date().toISOString(),
    status: "success",
    percentage: 100,
    startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    completedAt: new Date().toISOString(),
    initiatedBy: "admin@example.com",
    affectedFiles: 256,
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: "success",
    percentage: 100,
    startedAt: new Date(Date.now() - 90000000).toISOString(), // 25 hours ago
    completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    initiatedBy: "system@docspace.com",
    affectedFiles: 128,
  },
];

const meta = {
  title: "Pages/EncryptionPortal",
  component: EncryptionPortal,
  parameters: {
    docs: {
      description: {
        component:
          "The EncryptionPortal component displays a progress indicator during portal encryption processes.",
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Optional className for custom styling",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "800px", width: "100%", overflow: "hidden" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EncryptionPortal>;

export default meta;

type Story = StoryObj<typeof EncryptionPortal>;

/**
 * Default - Shows 50% progress
 */
export const Default: Story = {
  render: (args) => {
    return (
      <EncryptionPortal
        {...args}
        data-testid="encryption-portal-default"
        aria-label="Encryption Portal Default"
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        createGetEncryptionProgressHandler({ progress: PROGRESS.MEDIUM }),
      ],
    },
  },
};

/**
 * InProgress25 - Shows 25% progress
 */
export const InProgress25: Story = {
  render: (args) => {
    return (
      <EncryptionPortal
        {...args}
        data-testid="encryption-portal-progress-25"
        aria-label="Encryption Portal 25% Progress"
      />
    );
  },
  parameters: {
    msw: {
      handlers: [createGetEncryptionProgressHandler({ progress: 25 })],
    },
  },
};

/**
 * Complete - Shows 100% progress (completed encryption)
 */
export const Complete: Story = {
  render: (args) => {
    return (
      <EncryptionPortal
        {...args}
        data-testid="encryption-portal-complete"
        aria-label="Encryption Portal Complete"
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        createGetEncryptionProgressHandler({ progress: PROGRESS.COMPLETE }),
      ],
    },
  },
};

/**
 * LowProgress - Shows a low progress percentage (10%)
 */
export const LowProgress: Story = {
  render: (args) => {
    return (
      <EncryptionPortal
        {...args}
        data-testid="encryption-portal-low-progress"
        aria-label="Encryption Portal Low Progress"
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        createGetEncryptionProgressHandler({ progress: PROGRESS.LOW }),
      ],
    },
  },
};

/**
 * WithError - Shows error state
 */
export const WithError: Story = {
  render: (args) => {
    return (
      <EncryptionPortal
        {...args}
        data-testid="encryption-portal-error"
        aria-label="Encryption Portal Error"
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        createGetEncryptionProgressHandler({ error: "Test error message" }),
      ],
    },
  },
};

/**
 * WithHistory - Shows the encryption history with completed progress
 */
export const WithHistory: Story = {
  render: (args) => {
    return (
      <EncryptionPortal
        {...args}
        data-testid="encryption-portal-history"
        aria-label="Encryption Portal History"
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        createGetEncryptionProgressHandler({ progress: 100 }),
        createGetEncryptionHistoryHandler(MOCK_HISTORY),
      ],
    },
  },
};
