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
import { http, HttpResponse } from "msw";
import classNames from "classnames";

import { DeviceType } from "@docspace/shared/enums";
import { ButtonSize } from "@docspace/shared/components/button";

import styles from "../../../Backup.module.scss";
import RoomsModule from "./RoomsModule";

const meta: Meta<typeof RoomsModule> = {
  title: "Pages/Backup/ManualBackup/RoomsModule",
  component: RoomsModule,
  parameters: {
    docs: {
      description: {
        component: "RoomsModule component for manual backup functionality",
      },
    },
    msw: {
      handlers: [http.get("*/api/2.0/*", () => new HttpResponse(null))],
    },
  },
  argTypes: {
    onMakeCopy: { control: false },
    toDefault: { control: false },
    setBasePath: { control: false },
    setNewPath: { control: false },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <div className={classNames(styles.backupCommon, styles.manualBackup)}>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RoomsModule>;

export const Default: Story = {
  args: {
    buttonSize: ButtonSize.normal,
    maxWidth: "500px",
    isMaxProgress: true,
    newPath: "/",
    basePath: "/",
    isErrorPath: false,
    currentDeviceType: DeviceType.desktop,
    toDefault: () => {},
    setBasePath: () => {},
    setNewPath: () => {},
    onMakeCopy: async () => {
      return Promise.resolve();
    },
    settingsFileSelector: {
      getIcon: () => {},
    },
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    isErrorPath: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isMaxProgress: false,
  },
};
