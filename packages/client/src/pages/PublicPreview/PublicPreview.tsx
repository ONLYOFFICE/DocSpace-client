import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";
import { toastr } from "@docspace/shared/components/toast";

import type { TFile } from "@docspace/shared/api/files/types";
import type { PlaylistType } from "@docspace/shared/components/media-viewer/MediaViewer.types";

import type { PublicPreviewProps } from "./PublicPreview.types";

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
      "	https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    webUrl:
      "	https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
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
];

const PublicPreview = ({ getFilesSettings, getIcon }: PublicPreviewProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const settings = useCallback(async () => {
    try {
      setIsLoading(true);
      await getFilesSettings?.();
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [getFilesSettings]);

  useEffect(() => {
    settings();
  }, [settings]);

  const getIconUrl = useCallback(
    (size: number, ext: string) => {
      return getIcon?.(size, ext) ?? "";
    },
    [getIcon],
  );

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

  if (isLoading) return <div>...loading</div>;

  return (
    <div>
      {playlist.length > 0 && (
        <MediaViewer
          t={t}
          files={files}
          isPreviewFile
          playlist={playlist}
          visible={false}
          playlistPos={0}
          getIcon={getIconUrl}
          currentFileId={playlist[0].fileId}
          extsImagePreviewed={[
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
          ]}
        />
      )}
    </div>
  );
};

export default inject<TStore>(({ filesSettingsStore }) => {
  const { getFilesSettings, getIcon } = filesSettingsStore;

  return { getFilesSettings, getIcon };
})(observer(PublicPreview));
