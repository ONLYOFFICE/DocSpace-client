import { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "../../enums";
import type { TFile } from "../../api/files/types";
import { iconSize24, iconSize96 } from "../../utils/image-helpers";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

import { Portal } from "../portal";
import { Button } from "../button";

import { MediaViewer } from "./MediaViewer";
import type { MediaViewerProps, PlaylistType } from "./MediaViewer.types";

type MediaViewerType = typeof MediaViewer;
type Story = StoryObj<MediaViewerType>;

const meta = {
  title: "Components/MediaViewer",
  component: MediaViewer,
  parameters: {},
  decorators: [i18nextStoryDecorator],
} satisfies Meta<MediaViewerType>;

export default meta;

const DefaultTemplate = (props: MediaViewerProps) => {
  const { onClose, files, nextMedia, prevMedia } = props;

  const { t } = useTranslation();
  const [visible, setVisible] = useState<boolean>(false);
  const [playlistPos, setPlaylistPos] = useState(0);

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
      24: iconSize24,
      96: iconSize96,
    };

    const result = icons[size]?.get(extensions[extension]);

    return result;
  };

  const getIconStory = (size: number, ext: string) => {
    return getIconUrl(size, ext) ?? "";
  };

  return (
    <>
      <Button label="Open viewer" onClick={openMediaViewer} />
      {visible && (
        <Portal
          visible
          element={
            <MediaViewer
              {...props}
              t={t}
              visible={visible}
              playlist={playlist}
              isPreviewFile={false}
              getIcon={getIconStory}
              nextMedia={onNextMedia}
              prevMedia={onPrevMedia}
              playlistPos={playlistPos}
              onClose={onCloseMediaViewer}
              currentFileId={playlist[playlistPos].fileId}
            />
          }
        />
      )}
    </>
  );
};

const files: TFile[] = [
  {
    access: 0,
    canShare: true,
    comment: "",
    contentLength: "",
    created: new Date("2024-02-01T09:20:21.0000000Z"),
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
    },
    shared: false,
    thumbnailStatus: 1,
    title: "image_example_1.png",
    updated: new Date("2024-02-01T09:20:29.0000000Z"),
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
    access: 0,
    canShare: true,
    comment: "",
    contentLength: "",
    created: new Date("2024-01-01T00:00:00.0000000Z"),
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
    },
    shared: false,
    thumbnailStatus: 1,
    title: "image_example_2.svg",
    updated: new Date("2024-01-01T00:00:00.0000000Z"),
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
    viewUrl: "	https://api.onlyoffice.com/content/img/sprite.svg",
    webUrl: "	https://api.onlyoffice.com/content/img/sprite.svg",
  },

  // {
  //   access: 0,
  //   canShare: true,
  //   comment: "",
  //   contentLength: "",
  //   created: new Date("2024-01-01T00:00:00.0000000Z"),
  //   createdBy: {
  //     avatarSmall: "",
  //     displayName: "",
  //     hasAvatar: false,
  //     id: "f",
  //     profileUrl: "",
  //   },
  //   denyDownload: false,
  //   denySharing: false,
  //   fileExst: ".mp3",
  //   fileStatus: 0,
  //   fileType: 3,
  //   folderId: 17,
  //   id: 2,
  //   mute: false,
  //   pureContentLength: 5319693,
  //   rootFolderId: 2,
  //   rootFolderType: 14,
  //   security: {
  //     Convert: true,
  //     Copy: true,
  //     CustomFilter: true,
  //     Delete: true,
  //     Download: true,
  //     Duplicate: true,
  //     Edit: true,
  //     EditHistory: true,
  //     FillForms: true,
  //     Lock: true,
  //     Move: true,
  //     Read: true,
  //     ReadHistory: true,
  //     Rename: true,
  //     Review: true,
  //     SubmitToFormGallery: false,
  //   },
  //   shared: false,
  //   thumbnailStatus: 1,
  //   title: "BigBuckBunny.mp4",
  //   updated: new Date("2024-01-01T00:00:00.0000000Z"),
  //   updatedBy: {
  //     avatarSmall: "",
  //     displayName: "",
  //     hasAvatar: false,
  //     id: "",
  //     profileUrl: "",
  //   },
  //   version: 1,
  //   versionGroup: 1,
  //   viewAccessibility: {
  //     CanConvert: false,
  //     CoAuhtoring: false,
  //     ImageView: false,
  //     MediaView: true,
  //     MustConvert: false,
  //     WebComment: false,
  //     WebCustomFilterEditing: false,
  //     WebEdit: false,
  //     WebRestrictedEditing: false,
  //     WebReview: false,
  //     WebView: false,
  //   },
  //   viewUrl:
  //     "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  //   webUrl:
  //     "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  // },

  // {
  //   access: 0,
  //   canShare: true,
  //   comment: "",
  //   contentLength: "",
  //   created: new Date("2024-01-01T00:00:00.0000000Z"),
  //   createdBy: {
  //     avatarSmall: "",
  //     displayName: "",
  //     hasAvatar: false,
  //     id: "f",
  //     profileUrl: "",
  //   },
  //   denyDownload: false,
  //   denySharing: false,
  //   fileExst: ".mp3",
  //   fileStatus: 0,
  //   fileType: 3,
  //   folderId: 17,
  //   id: 3,
  //   mute: false,
  //   pureContentLength: 5319693,
  //   rootFolderId: 2,
  //   rootFolderType: 14,
  //   security: {
  //     Convert: true,
  //     Copy: true,
  //     CustomFilter: true,
  //     Delete: true,
  //     Download: true,
  //     Duplicate: true,
  //     Edit: true,
  //     EditHistory: true,
  //     FillForms: true,
  //     Lock: true,
  //     Move: true,
  //     Read: true,
  //     ReadHistory: true,
  //     Rename: true,
  //     Review: true,
  //     SubmitToFormGallery: false,
  //   },
  //   shared: false,
  //   thumbnailStatus: 1,
  //   title: "Sample MP3 File.mp3",
  //   updated: new Date("2024-01-01T00:00:00.0000000Z"),
  //   updatedBy: {
  //     avatarSmall: "",
  //     displayName: "",
  //     hasAvatar: false,
  //     id: "",
  //     profileUrl: "",
  //   },
  //   version: 1,
  //   versionGroup: 1,
  //   viewAccessibility: {
  //     CanConvert: false,
  //     CoAuhtoring: false,
  //     ImageView: false,
  //     MediaView: true,
  //     MustConvert: false,
  //     WebComment: false,
  //     WebCustomFilterEditing: false,
  //     WebEdit: false,
  //     WebRestrictedEditing: false,
  //     WebReview: false,
  //     WebView: false,
  //   },
  //   viewUrl:
  //     "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  //   webUrl:
  //     "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  // },
];

export const Default = {
  args: {
    files,
    extsImagePreviewed: [
      ".svg",
      ".bmp",
      ".gif",
      ".jpeg",
      ".jpg",
      ".png",
      ".ico",
      ".tif",
      ".tiff",
      ".webp",
    ],
    currentDeviceType: DeviceType.desktop,
  },

  render: (props) => {
    return <DefaultTemplate {...props} />;
  },
} satisfies Story;
