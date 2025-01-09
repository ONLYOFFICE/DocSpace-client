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

import { Meta, StoryObj } from "@storybook/react";

import Share from "./index";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";
import type { ShareProps } from "./Share.types";

const meta: Meta<typeof Share> = {
  title: "Components/Share",
  component: Share,
  parameters: {
    docs: {
      description: {
        component: `A component for sharing files and managing shared links.

### Features
- Display file sharing status and information
- Create and manage sharing links
- Control access rights for shared files
- Support for internal and external sharing`,
      },
    },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof Share>;

export default meta;
type Story = StoryObj<typeof Share>;

const Template = (args: ShareProps) => <Share {...args} />;

const createDefaultProps = (): ShareProps => ({
  selfId: "current-user-id",
  infoPanelSelection: {
    isFile: false,
    access: 0,
    canShare: true,
    comment: "Test comment",
    contentLength: "1 MB",
    created: new Date("2025-01-09T13:47:37+03:00"),
    createdBy: {
      avatarSmall: "",
      displayName: "Test User",
      hasAvatar: false,
      id: "1",
      profileUrl: "",
    },
    denyDownload: false,
    denySharing: false,
    fileExst: ".txt",
    fileStatus: 0,
    fileType: 0,
    folderId: 1,
    id: 1,
    mute: false,
    pureContentLength: 1024,
    rootFolderId: 0,
    rootFolderType: 0,
    security: {
      Convert: false,
      Copy: true,
      CustomFilter: false,
      Delete: true,
      Download: true,
      Duplicate: false,
      Edit: true,
      EditHistory: false,
      FillForms: false,
      Lock: false,
      Move: true,
      Read: true,
      ReadHistory: false,
      Rename: true,
      Review: false,
      SubmitToFormGallery: false,
    },
    shared: true,
    thumbnailStatus: 0,
    title: "Test Document",
    updated: new Date("2025-01-09T13:47:37+03:00"),
    updatedBy: {
      avatarSmall: "",
      displayName: "Test User",
      hasAvatar: false,
      id: "1",
      profileUrl: "",
    },
    version: 1,
    versionGroup: 1,
    viewAccessibility: {
      CanConvert: false,
      CoAuhtoring: true,
      ImageView: true,
      MediaView: true,
      MustConvert: false,
      WebComment: true,
      WebCustomFilterEditing: false,
      WebEdit: true,
      WebRestrictedEditing: false,
      WebReview: true,
      WebView: true,
    },
    viewUrl: "https://example.com/view",
    webUrl: "https://example.com/web",
  },
});

export const Default: Story = {
  render: (args) => Template({ ...createDefaultProps(false), ...args }),
  args: {},
};

export const Hidden: Story = {
  render: (args) => Template({ ...createDefaultProps(true), ...args }),
  args: {},
};

export const WithSharedInfo: Story = {
  render: (args) => Template({ ...createDefaultProps(false), ...args }),
  args: {
    infoPanelSelection: {
      ...createDefaultProps(false).infoPanelSelection,
      shared: true,
    },
  },
};
