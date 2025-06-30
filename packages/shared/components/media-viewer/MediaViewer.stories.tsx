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
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "../../enums";
import type { TFile } from "../../api/files/types";
import { iconSize32, iconSize96 } from "../../utils/image-helpers";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

import { Portal } from "../portal";
import { Button } from "../button";

import MediaViewer from "./MediaViewer";
import type { MediaViewerProps, PlaylistType } from "./MediaViewer.types";

const meta: Meta<typeof MediaViewer> = {
  title: "Components/MediaViewer",
  component: MediaViewer,
  parameters: {
    docs: {
      description: {
        component: `MediaViewer is a component for displaying various media types with a focus on images. 
        It supports playlist functionality and responsive design for different device types.`,
      },
    },
  },
  argTypes: {
    currentDeviceType: {
      control: { type: "select" },
      options: Object.values(DeviceType),
      description: "Device type for responsive display",
    },
    files: {
      control: "object",
      description: "Array of media files to display",
    },
    onClose: { action: "closed" },
    nextMedia: { action: "next" },
    prevMedia: { action: "previous" },
  },
  decorators: [i18nextStoryDecorator],
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof MediaViewer>;

const DefaultTemplate = (props: MediaViewerProps) => {
  const { onClose, files, nextMedia, prevMedia } = props;
  const { t } = useTranslation();
  const [visible, setVisible] = React.useState<boolean>(false);
  const [playlistPos, setPlaylistPos] = React.useState(0);

  const openMediaViewer = () => setVisible(true);

  const onCloseMediaViewer = () => {
    onClose?.();
    setVisible(false);
    setPlaylistPos(0);
  };

  const playlist: PlaylistType[] = files.map((file, index) => ({
    id: index,
    fileId: file.id,
    src: file.viewUrl,
    title: file.title,
    fileExst: file.fileExst,
    fileStatus: file.fileStatus,
    canShare: file.canShare,
    version: file.version,
    thumbnailUrl: "",
  }));

  const onNextMedia = () => {
    const nextPlaylistPos = (playlistPos + 1) % playlist.length;
    if (nextPlaylistPos !== 0) setPlaylistPos(nextPlaylistPos);
    nextMedia?.();
  };

  const onPrevMedia = () => {
    const nextPlaylistPos = playlistPos - 1;
    if (nextPlaylistPos !== -1) setPlaylistPos(nextPlaylistPos);
    prevMedia?.();
  };

  const getIconUrl = (size: number, extension: string) => {
    const extensions: Record<string, string> = {
      ".mp4": "mp4.svg",
      ".png": "png.svg",
      ".jpg": "jpg.svg",
      ".mp3": "sound.svg",
    };

    const icons: Record<number, Map<string, string>> = {
      32: iconSize32,
      96: iconSize96,
    };

    return icons[size]?.get(extensions[extension]) ?? "";
  };

  return (
    <>
      <Button label="Open viewer" onClick={openMediaViewer} />
      {visible ? (
        <Portal
          element={
            <MediaViewer
              {...props}
              t={t}
              visible={visible}
              playlist={playlist}
              isPreviewFile={false}
              getIcon={getIconUrl}
              nextMedia={onNextMedia}
              prevMedia={onPrevMedia}
              playlistPos={playlistPos}
              onClose={onCloseMediaViewer}
              currentFileId={playlist[playlistPos]?.fileId}
            />
          }
        />
      ) : null}
    </>
  );
};

const filesMock: TFile[] = [
  {
    shortWebUrl: "",
    isFile: true,
    access: 0,
    canShare: true,
    comment: "",
    contentLength: "",
    created: "2024-02-01T09:20:21.0000000Z",
    createdBy: {
      avatarSmall: "",
      displayName: "",
      hasAvatar: false,
      id: "",
      profileUrl: "",
    },
    denyDownload: false,
    denySharing: false,
    fileExst: ".png",
    fileStatus: 0,
    fileType: 3,
    folderId: 17,
    fileEntryType: 2,
    id: 0,
    mute: false,
    pureContentLength: 5319693,
    rootFolderId: 2,
    rootFolderType: 14,
    security: {
      Convert: true,
      Copy: true,
      CustomFilter: true,
      Delete: true,
      Download: true,
      Duplicate: true,
      Edit: true,
      EditHistory: true,
      FillForms: true,
      Lock: true,
      Move: true,
      Read: true,
      ReadHistory: true,
      Rename: true,
      Review: true,
      SubmitToFormGallery: false,
      EditForm: false,
      Comment: false,
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: false,
    },
    shared: false,
    thumbnailStatus: 1,
    title: "image_example_1.png",
    updated: "2024-02-01T09:20:29.0000000Z",
    updatedBy: {
      avatarSmall: "",
      displayName: "",
      hasAvatar: false,
      id: "",
      profileUrl: "",
    },
    version: 1,
    versionGroup: 1,
    viewAccessibility: {
      CanConvert: false,
      CoAuhtoring: false,
      ImageView: false,
      MediaView: true,
      MustConvert: false,
      WebComment: false,
      WebCustomFilterEditing: false,
      WebEdit: false,
      WebRestrictedEditing: false,
      WebReview: false,
      WebView: false,
    },
    viewUrl:
      "https://helpcenter.onlyoffice.com/ru/images/Help/Guides/big/guide139/hyperlink_settings.png",
    webUrl:
      "https://helpcenter.onlyoffice.com/ru/images/Help/Guides/big/guide139/hyperlink_settings.png",
  },
  {
    shortWebUrl: "",
    isFile: true,
    access: 0,
    canShare: true,
    comment: "",
    contentLength: "",
    created: "2024-01-01T00:00:00.0000000Z",
    createdBy: {
      avatarSmall: "",
      displayName: "",
      hasAvatar: false,
      id: "f",
      profileUrl: "",
    },
    denyDownload: false,
    denySharing: false,
    fileExst: ".svg",
    fileStatus: 0,
    fileType: 3,
    folderId: 17,
    fileEntryType: 2,
    id: 1,
    mute: false,
    pureContentLength: 5319693,
    rootFolderId: 2,
    rootFolderType: 14,
    security: {
      Convert: true,
      Copy: true,
      CustomFilter: true,
      Delete: true,
      Download: true,
      Duplicate: true,
      Edit: true,
      EditHistory: true,
      FillForms: true,
      Lock: true,
      Move: true,
      Read: true,
      ReadHistory: true,
      Rename: true,
      Review: true,
      SubmitToFormGallery: false,
      EditForm: false,
      Comment: false,
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: false,
    },
    shared: false,
    thumbnailStatus: 1,
    title: "image_example_2.svg",
    updated: "2025-02-14T19:43:18.0000000+05:00",
    updatedBy: {
      avatarSmall: "",
      displayName: "",
      hasAvatar: false,
      id: "",
      profileUrl: "",
    },
    version: 1,
    versionGroup: 1,
    viewAccessibility: {
      CanConvert: false,
      CoAuhtoring: false,
      ImageView: false,
      MediaView: true,
      MustConvert: false,
      WebComment: false,
      WebCustomFilterEditing: false,
      WebEdit: false,
      WebRestrictedEditing: false,
      WebReview: false,
      WebView: false,
    },
    viewUrl:
      "https://helpcenter.onlyoffice.com/ru/images/Help/GettingStarted/DocSpace/Big/RoomTypes.png",
    webUrl:
      "https://helpcenter.onlyoffice.com/ru/images/Help/GettingStarted/DocSpace/Big/RoomTypes.png",
  },
];

const extsImagePreviewed = [".png", ".jpg", ".jpeg", ".gif", ".svg"];

export const ImageGallery: Story = {
  args: {
    files: filesMock,
    currentDeviceType: DeviceType.desktop,
    extsImagePreviewed,
    visible: true,
  },
  parameters: {
    docs: {
      description: {
        story: `Gallery view showing multiple images with navigation capabilities.`,
      },
    },
  },
  render: (args) => <DefaultTemplate {...args} />,
};

export const MobileView: Story = {
  args: {
    files: filesMock,
    currentDeviceType: DeviceType.mobile,
    extsImagePreviewed,
    visible: true,
  },
  parameters: {
    docs: {
      description: {
        story: `Mobile-optimized view of the image viewer.`,
      },
    },
  },
  render: (args) => <DefaultTemplate {...args} />,
};
