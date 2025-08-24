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

import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import { useParams, useSearchParams } from "react-router";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { getFileInfo } from "@docspace/shared/api/files";
import { UrlActionType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import type { TFile } from "@docspace/shared/api/files/types";
import type {
  NumberOrString,
  PlaylistType,
} from "@docspace/shared/components/media-viewer/MediaViewer.types";
import { Error403 } from "@docspace/shared/components/errors/Error403";
import { ViewerLoader } from "@docspace/shared/components/media-viewer/sub-components/ViewerLoader";
import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";

import { DEFAULT_EXTS_IMAGE } from "./PublicPreview.constants";
import { isAxiosError, useDeviceType } from "./PublicPreview.helpers";

import type { PublicPreviewViewerProps } from "./PublicPreview.types";

const PublicPreviewViewer: FC<PublicPreviewViewerProps> = ({
  extsImagePreviewed,
  openUrl,
  getIcon,
}) => {
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

      const fileInfo = await getFileInfo(id, key);

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
  }, [searchParams, id]);

  useEffect(() => {
    init();
  }, [init]);

  const playlist: PlaylistType[] = useMemo(
    () =>
      files.map((file, index) => ({
        id: index,
        fileId: file.id,
        src: file.viewUrl,
        title: file.title,
        fileExst: file.fileExst,
        fileStatus: file.fileStatus,
        canShare: file.canShare,
        version: file.version,
        thumbnailUrl: file.thumbnailUrl ?? "",
      })),
    [files],
  );

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

  const getIconUrl = useCallback(
    (size: number, ext: string) => {
      return getIcon?.(size, ext) ?? "";
    },
    [getIcon],
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

export default inject<TStore>(({ settingsStore }) => {
  const { openUrl } = settingsStore;

  return { openUrl };
})(
  observer(
    PublicPreviewViewer as FC<Omit<PublicPreviewViewerProps, "openUrl">>,
  ),
);
