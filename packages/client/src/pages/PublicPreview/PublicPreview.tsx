import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import { useParams, useSearchParams } from "react-router-dom";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";
import { ViewerLoader } from "@docspace/shared/components/media-viewer/sub-components/ViewerLoader";

import type { TFile } from "@docspace/shared/api/files/types";
import type { PlaylistType } from "@docspace/shared/components/media-viewer/MediaViewer.types";

import type { PublicPreviewProps } from "./PublicPreview.types";
import { DEFAULT_EXTS_IMAGE } from "./PublicPreview.constants";
import { useDeviceType } from "./PublicPreview.helpers";

const PublicPreview = ({
  getIcon,
  getFilesSettings,
  extsImagePreviewed,
}: PublicPreviewProps) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const currentDeviceType = useDeviceType();

  const [files, setFiles] = useState<TFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const init = useCallback(async () => {
    const key = searchParams.get("share");

    if (!id || !key) return;

    try {
      setIsLoading(true);

      const [fileInfo] = await Promise.all([
        api.files.getFileInfo(id, key),
        getFilesSettings?.(),
      ]);

      if (!fileInfo) return;

      setFiles([fileInfo]);
    } catch (error) {
      if (error instanceof Error) toastr.error(error);

      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [getFilesSettings, searchParams, id]);

  useEffect(() => {
    init();
  }, [init]);

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

  if (isLoading) return <ViewerLoader isLoading />;

  return (
    <div>
      {playlist.length > 0 && (
        <MediaViewer
          t={t}
          visible
          files={files}
          isPublicFile
          playlistPos={0}
          playlist={playlist}
          getIcon={getIconUrl}
          currentFileId={playlist[0].fileId}
          currentDeviceType={currentDeviceType}
          extsImagePreviewed={extsImagePreviewed ?? DEFAULT_EXTS_IMAGE}
        />
      )}
    </div>
  );
};

export default inject<TStore>(({ filesSettingsStore }) => {
  const { getFilesSettings, getIcon, extsImagePreviewed } = filesSettingsStore;

  return { getFilesSettings, getIcon, extsImagePreviewed };
})(observer(PublicPreview));
