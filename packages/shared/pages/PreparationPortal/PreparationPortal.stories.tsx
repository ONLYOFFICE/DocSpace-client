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
import type { Meta, StoryObj } from "@storybook/react";
import { PreparationPortal } from ".";
import { createGetRestoreProgressHandler } from "../../__mocks__/storybook/handlers/portal/restore";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

const meta = {
  title: "Pages/PreparationPortal",
  component: PreparationPortal,
  parameters: {
    docs: {
      description: {
        component: `The PreparationPortal component displays a progress indicator during portal restoration or preparation processes.`,
      },
      disable: true,
    },
  },
  argTypes: {
    withoutHeader: {
      control: "boolean",
      description: "Whether to show the header text",
    },
    isDialog: {
      control: "boolean",
      description: "Whether the component is used as a dialog",
    },
    style: {
      control: "object",
      description: "Custom styles for the component",
    },
  },
  decorators: [
    i18nextStoryDecorator,
    (Story) => (
      <div style={{ height: "800px", width: "100%", overflow: "hidden" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreparationPortal>;

type Story = StoryObj<typeof PreparationPortal>;

export default meta;

export const Default: Story = {
  render: (args) => {
    return <PreparationPortal {...args} />;
  },
  parameters: {
    docs: { disable: false },
    msw: {
      handlers: [createGetRestoreProgressHandler({ progress: 70 })],
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    return <PreparationPortal {...args} />;
  },
  parameters: {
    msw: {
      handlers: [
        createGetRestoreProgressHandler({
          progress: 0,
          error: "Something went wrong",
        }),
      ],
    },
  },
};

export const WithoutHeader: Story = {
  render: (args) => {
    return <PreparationPortal {...args} />;
  },
  args: {
    withoutHeader: true,
  },
  parameters: {
    msw: {
      handlers: [createGetRestoreProgressHandler({ progress: 20 })],
    },
  },
};
