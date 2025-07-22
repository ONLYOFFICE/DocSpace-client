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

import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import { fn } from "@storybook/test";

import AmazonSettings from "./AmazonSettings";
import { AmazonSettingsProps } from "./AmazonSettings.types";
import { bucket, SERVICE_URL } from "./AmazonSettings.constants";
import {
  mockSelectedStorage,
  mockStorageRegions,
  mockFormSettings,
  mockErrorsFields,
} from "./mockData";

const meta = {
  title: "Components/AmazonSettings",
  component: AmazonSettings,
  parameters: {
    docs: {
      description: {
        component:
          "A component for configuring Amazon S3 storage settings with various options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selectedStorage: { control: "object" },
    storageRegions: { control: "object" },
    formSettings: { control: "object" },
    defaultRegion: { control: "text" },
    errorsFieldsBeforeSafe: { control: "object" },
    isNeedFilePath: { control: "boolean" },
    isLoading: { control: "boolean" },
    isLoadingData: { control: "boolean" },
  },
} satisfies Meta<typeof AmazonSettings>;

export default meta;
type Story = StoryObj<typeof AmazonSettings>;

const AmazonSettingsWrapper = (props: Omit<AmazonSettingsProps, "t">) => {
  const { t } = useTranslation(["Common"]);
  return <AmazonSettings t={t} {...props} />;
};

export const Default: Story = {
  render: (args) => <AmazonSettingsWrapper {...args} />,
  args: {
    selectedStorage: mockSelectedStorage,
    storageRegions: mockStorageRegions,
    formSettings: mockFormSettings,
    defaultRegion: "eu-central-1",
    errorsFieldsBeforeSafe: mockErrorsFields,
    isNeedFilePath: true,
    isLoading: false,
    isLoadingData: false,
    setRequiredFormSettings: fn(),
    setIsThirdStorageChanged: fn(),
    addValueInFormSettings: fn(),
    deleteValueFormSetting: fn(),
  },
};

export const WithErrors: Story = {
  render: (args) => <AmazonSettingsWrapper {...args} />,
  args: {
    ...Default.args,
    errorsFieldsBeforeSafe: {
      ...mockErrorsFields,
      [bucket]: true,
      [SERVICE_URL]: true,
    },
  },
};

export const Loading: Story = {
  render: (args) => <AmazonSettingsWrapper {...args} />,
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const DataLoading: Story = {
  render: (args) => <AmazonSettingsWrapper {...args} />,
  args: {
    ...Default.args,
    isLoadingData: true,
  },
};

export const WithoutFilePath: Story = {
  render: (args) => <AmazonSettingsWrapper {...args} />,
  args: {
    ...Default.args,
    isNeedFilePath: false,
  },
};

export const UnsetStorage: Story = {
  render: (args) => <AmazonSettingsWrapper {...args} />,
  args: {
    ...Default.args,
    selectedStorage: {
      ...mockSelectedStorage,
      isSet: false,
    },
  },
};
