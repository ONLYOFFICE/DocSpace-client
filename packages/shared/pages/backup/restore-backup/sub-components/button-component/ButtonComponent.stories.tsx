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
import { useTranslation } from "react-i18next";

import ButtonContainer from "./ButtonComponent";
import type { ButtonContainerProps } from "./ButtonContainer.types";

const ButtonComponentWithTranslation = (
  args: Omit<ButtonContainerProps, "t">,
) => {
  const { t } = useTranslation();
  return <ButtonContainer {...args} t={t} />;
};

const meta: Meta<typeof ButtonContainer> = {
  title: "Pages/Backup/RestoreBackup/ButtonComponent",
  component: ButtonComponentWithTranslation,
  parameters: {
    docs: {
      description: {
        component: "Button component for the restore backup process",
      },
    },
  },
  argTypes: {
    navigate: { table: { disable: true } },
    setTenantStatus: { table: { disable: true } },
    isFormReady: { table: { disable: true } },
    getStorageParams: { table: { disable: true } },
    uploadLocalFile: { table: { disable: true } },
    setErrorInformation: { table: { disable: true } },
    setIsBackupProgressVisible: { table: { disable: true } },
    getStorageType: { table: { disable: true } },
    t: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonComponentWithTranslation>;

export const Default: Story = {
  args: {
    isConfirmed: true,
    downloadingProgress: 100,
    isNotification: false,
    restoreResource: "backup.zip",
    isCheckedThirdPartyStorage: false,
    isCheckedLocalFile: false,
    isEnableRestore: true,
    isFormReady: () => true,
    isBackupProgressVisible: false,
    getStorageType: () => 0,
    getStorageParams: () => [],
    uploadLocalFile: async () => null,
    setTenantStatus: () => {},
    navigate: () => {},
    setErrorInformation: () => {},
    setIsBackupProgressVisible: () => {},
    operationsAlert: false,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isConfirmed: false,
    isEnableRestore: false,
  },
};

export const WithProgress: Story = {
  args: {
    ...Default.args,
    downloadingProgress: 50,
    isBackupProgressVisible: true,
  },
};

export const WithProgressComplete: Story = {
  args: {
    ...Default.args,
    downloadingProgress: 100,
    isBackupProgressVisible: true,
  },
};
