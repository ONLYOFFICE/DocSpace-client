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

import { StoryObj, Meta } from "@storybook/react";

import Dropzone from ".";

const meta = {
  title: "Components/Dropzone",
  component: Dropzone,
  argTypes: {
    isLoading: {
      control: "boolean",
      description: "Shows loading state of the dropzone",
      defaultValue: false,
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the dropzone",
      defaultValue: false,
    },
    linkMainText: {
      control: "text",
      description: "Main text displayed in the dropzone",
    },
    linkSecondaryText: {
      control: "text",
      description: "Secondary text displayed in the dropzone",
    },
    exstsText: {
      control: "text",
      description: "Text displaying supported file types",
    },
    accept: {
      control: "object",
      description: "Accepted file types (string or array of strings)",
    },
    maxFiles: {
      control: "number",
      description: "Maximum number of files allowed (0 for unlimited)",
      defaultValue: 0,
    },
    onDrop: { action: "dropped" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A component for handling file uploads through drag and drop or file selection.",
      },
    },
  },
} satisfies Meta<typeof Dropzone>;

type Story = StoryObj<typeof Dropzone>;

export default meta;

const defaultArgs = {
  isLoading: false,
  isDisabled: false,
  linkMainText: "Click to upload",
  linkSecondaryText: "or drag and drop files here",
  exstsText: "Supported file types: PDF, DOC, DOCX",
  accept: [".pdf", ".doc", ".docx"],
  maxFiles: 0,
  onDrop: () => {},
};

export const Default: Story = {
  args: defaultArgs,
};

export const Loading: Story = {
  args: {
    ...defaultArgs,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    isDisabled: true,
  },
};

export const SingleFileUpload: Story = {
  args: {
    ...defaultArgs,
    maxFiles: 1,
    linkMainText: "Upload single file",
    linkSecondaryText: "or drag it here",
  },
};

export const ImageUpload: Story = {
  args: {
    ...defaultArgs,
    accept: [".png", ".jpg", ".jpeg", ".gif"],
    linkMainText: "Upload images",
    linkSecondaryText: "or drag them here",
    exstsText: "Supported file types: PNG, JPG, JPEG, GIF",
  },
};
