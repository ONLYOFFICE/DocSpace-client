import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import { useParams, useSearchParams } from "react-router";

import api from "@docspace/shared/api";
import { UrlActionType, ValidationStatus } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";
import { ViewerLoader } from "@docspace/shared/components/media-viewer/sub-components/ViewerLoader";
import { Error403 } from "@docspace/shared/components/errors/Error403";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { validatePublicRoomKey } from "@docspace/shared/api/rooms";
import type { TFile } from "@docspace/shared/api/files/types";
import type {
  NumberOrString,
  PlaylistType,
} from "@docspace/shared/components/media-viewer/MediaViewer.types";

import type { PublicPreviewProps } from "./PublicPreview.types";
import { DEFAULT_EXTS_IMAGE } from "./PublicPreview.constants";
import { isAxiosError, useDeviceType } from "./PublicPreview.helpers";

const PublicPreview = ({
  getIcon,
  openUrl,
  getFilesSettings,
  extsImagePreviewed,
}: PublicPreviewProps) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const currentDeviceType = useDeviceType();

  const [files, setFiles] = useState<TFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [errorStatus, setErrorStatus] = useState<number>();

  const init = useCallback(async () => {
    const key = searchParams.get("share");

    if (!id || !key) return;

    try {
      setIsLoading(true);

      const response = await validatePublicRoomKey(key);

      if (
        response &&
        response.status === ValidationStatus.ExternalAccessDenied
      ) {
        const pathName = window.location.pathname;
        const searchName = window.location.search;

        window.location.href = combineUrl(
          window.ClientConfig?.proxy?.url,
          "/login",
          `?referenceUrl=${pathName}${searchName}`,
        );

        return;
      }

      const [fileInfo] = await Promise.all([
        api.files.getFileInfo(id, key),
        getFilesSettings?.(),
      ]);

      if (!fileInfo) return;

      setFiles([fileInfo]);
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;

        if (status !== undefined && status === 403) {
          return setErrorStatus(status);
        }

        toastr.error(error);
      }

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
    thumbnailUrl: file.thumbnailUrl ?? "",
  }));

  const onDownloadMediaFile = useCallback(
    (fileId: NumberOrString) => {
      if (playlist.length > 0) {
        const viewUrlFile = playlist.find(
          (file) => file.fileId === fileId,
        )?.src;

        if (!viewUrlFile) return;

        return openUrl?.(viewUrlFile, UrlActionType.Download);
      }
    },
    [playlist, openUrl],
  );

  if (errorStatus === 403) return <Error403 />;

  if (isLoading) return <ViewerLoader isLoading />;

  return (
    <div>
      {playlist.length > 0 ? (
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
          onDownload={onDownloadMediaFile}
        />
      ) : null}
    </div>
  );
};

export const WrappedComponent = inject<TStore>(
  ({ filesSettingsStore, settingsStore }) => {
    const { getFilesSettings, getIcon, extsImagePreviewed } =
      filesSettingsStore;
    const { openUrl } = settingsStore;

    return { getFilesSettings, getIcon, openUrl, extsImagePreviewed };
  },
)(observer(PublicPreview));
