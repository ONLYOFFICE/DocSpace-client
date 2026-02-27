// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import DropzoneComponent from "@docspace/ui-kit/components/dropzone";
import UploadSvgUrl from "PUBLIC_DIR/images/upload.svg?url";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import { toastr } from "@docspace/ui-kit/components/toast";
import { frameCallEvent } from "@docspace/shared/utils/common";
import {
  finalizeUploadSession,
  startUploadSession,
  uploadChunkParallel,
} from "@docspace/shared/api/files";
import { TFilesSettings } from "@docspace/shared/api/files/types";

import { useSDKConfig } from "@/providers/SDKConfigProvider";

import type { TFileWithOptionalLastModifiedDate } from "./_types";
import {
  isEmptyDirectoryFile,
  attachParentFolderId,
  runWithConcurrency,
  createChunks,
  parseSizeLimit,
} from "./_utils";
import styles from "./Uploader.module.scss";
import { getErrorMessage } from "@/utils";
import {
  DEFAULT_CHUNK_UPLOAD_SIZE,
  DEFAULT_MAX_UPLOAD_FILES_COUNT,
  DEFAULT_MAX_UPLOAD_THREAD_COUNT,
} from "@/utils/constants";

export type UploaderClientProps = {
  filesSettings?: TFilesSettings;
  accept: string;
  shortText: string;
  fullText?: string;
  badgeValue?: number;
  baseConfig?: {
    targetId?: string;
    acceptExtensions?: string;
    linkMainText?: string;
    secondaryText?: string;
    extensionsText?: string;
    isFolderUpload?: boolean;
    isMultipleUpload?: boolean;
    maxPerUploadSize?: string;
    maxTotalUploadSize?: string;
  };
};

export default function UploaderClient({
  accept,
  shortText,
  fullText,
  badgeValue,
  filesSettings,
  baseConfig,
}: UploaderClientProps) {
  useSDKConfig();
  useDocumentTitle("Uploader");

  const { t } = useTranslation(["Common"]);

  const folderTargetId = +(baseConfig?.targetId ?? 0);

  const chunkUploadSize =
    filesSettings?.chunkUploadSize || DEFAULT_CHUNK_UPLOAD_SIZE;
  const maxUploadThreadCount =
    filesSettings?.maxUploadThreadCount || DEFAULT_MAX_UPLOAD_THREAD_COUNT;
  const maxUploadFilesCount =
    filesSettings?.maxUploadFilesCount || DEFAULT_MAX_UPLOAD_FILES_COUNT;

  const [isLoading, setIsLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const uploadFiles = useCallback(async (rawFiles: File[]) => {
    const prepared = await attachParentFolderId(rawFiles, folderTargetId);

    const onlyFiles = prepared.filter((f) => !isEmptyDirectoryFile(f));

    const uploadedFiles: unknown[] = [];

    const totalBytes = onlyFiles.reduce((sum, f) => sum + f.size, 0);
    let uploadedBytes = 0;

    setUploadPercent(0);

    await runWithConcurrency(onlyFiles, maxUploadFilesCount, async (file) => {
      const targetFolderId = file.parentFolderId ?? folderTargetId;

      const session = await startUploadSession(
        targetFolderId,
        file.name,
        file.size,
        "",
        false,
        (file as TFileWithOptionalLastModifiedDate).lastModifiedDate ??
          file.lastModified,
        true,
      );

      const chunks = createChunks(file, chunkUploadSize);
      let uploadedChunks = 0;

      frameCallEvent({
        event: "onUploadProgress",
        data: {
          sessionId: session.id,
          fileName: file.name,
          uploadedChunks: 0,
          totalChunks: chunks.length,
          percent: 0,
        },
      });

      await runWithConcurrency(chunks, maxUploadThreadCount, async (chunk) => {
        await uploadChunkParallel(
          targetFolderId,
          session.id,
          chunk.index,
          chunk.data,
        );

        uploadedChunks += 1;
        uploadedBytes += chunk.size;
        const filePercent = Math.round((uploadedChunks / chunks.length) * 100);
        const overallPercent = Math.round((uploadedBytes / totalBytes) * 100);

        setUploadPercent(overallPercent);

        frameCallEvent({
          event: "onUploadProgress",
          data: {
            sessionId: session.id,
            fileName: file.name,
            uploadedChunks,
            totalChunks: chunks.length,
            percent: filePercent,
          },
        });
      });

      const result = await finalizeUploadSession(targetFolderId, session.id);
      uploadedFiles.push(result);
    });

    return uploadedFiles;
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      const maxPerUploadBytes = parseSizeLimit(baseConfig?.maxPerUploadSize);

      if (maxPerUploadBytes) {
        const oversizedFiles = acceptedFiles.filter(
          (file) => file.size > maxPerUploadBytes,
        );

        if (oversizedFiles.length > 0) {
          const maxSizeFormatted = baseConfig?.maxPerUploadSize?.toUpperCase();
          const isFolderUpload = baseConfig?.isFolderUpload ?? false;

          if (isFolderUpload) {
            toastr.error(
              t("Common:FolderSizeExceedsLimit", { maxSize: maxSizeFormatted }),
            );
          } else {
            toastr.error(
              t("Common:FileSizeExceedsLimit", { maxSize: maxSizeFormatted }),
            );
          }
          return;
        }
      }

      if (baseConfig?.isMultipleUpload && baseConfig?.maxTotalUploadSize) {
        const maxTotalBytes = parseSizeLimit(baseConfig.maxTotalUploadSize);

        if (maxTotalBytes) {
          const totalSize = acceptedFiles.reduce(
            (sum, file) => sum + file.size,
            0,
          );

          if (totalSize > maxTotalBytes) {
            const maxTotalFormatted =
              baseConfig.maxTotalUploadSize.toUpperCase();
            const isFolderUpload = baseConfig?.isFolderUpload ?? false;

            if (isFolderUpload) {
              toastr.error(
                t("Common:FoldersSizeExceedsLimit", {
                  maxSize: maxTotalFormatted,
                }),
              );
            } else {
              toastr.error(
                t("Common:FilesSizeExceedsLimit", {
                  maxSize: maxTotalFormatted,
                }),
              );
            }
            return;
          }
        }
      }

      setIsLoading(true);

      try {
        const uploadedFiles = await uploadFiles(acceptedFiles);
        const folderUrl = `${window.location.origin}/rooms/personal/filter?folder=${folderTargetId}`;

        toastr.success(
          <>
            {t("Common:ItemsSuccessfullyUploaded", {
              count: acceptedFiles.length,
            })}
            <br />
            <a
              href={folderUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {t("Common:Open")}
            </a>
          </>,
          t("Common:Done"),
        );

        frameCallEvent({
          event: "onUploadSuccess",
          data: uploadedFiles,
        });
      } catch (err) {
        const message = getErrorMessage(err) || t("Common:UnexpectedError");
        toastr.error(message);

        frameCallEvent({
          event: "onUploadError",
          data: { error: message },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [t, uploadFiles],
  );

  const getSecondaryText = () => {
    if (baseConfig?.secondaryText) {
      return baseConfig.secondaryText;
    }

    const isFolderUpload = baseConfig?.isFolderUpload ?? false;
    const isMultipleUpload = baseConfig?.isMultipleUpload ?? true;

    if (isFolderUpload && isMultipleUpload) {
      return t("Common:DropzoneFoldersSecondary");
    }
    if (isFolderUpload && !isMultipleUpload) {
      return t("Common:DropzoneFolderSecondary");
    }
    if (!isFolderUpload && isMultipleUpload) {
      return t("Common:DropzoneFilesSecondary");
    }
    return t("Common:DropzoneTitleSecondary");
  };

  return (
    <DropzoneComponent
      isDisabled={isLoading}
      isLoading={isLoading}
      uploadPercent={uploadPercent}
      isFolderUpload={baseConfig?.isFolderUpload}
      isMultipleUpload={baseConfig?.isMultipleUpload}
      onSingleUploadError={() => {
        toastr.warning(t("Common:SingleUploadWarning"));
      }}
      onDrop={onDrop}
      accept={accept}
      getFilesFromEvent={getFilesFromEvent}
      linkMainText={baseConfig?.linkMainText ?? t("Common:Upload")}
      linkSecondaryText={getSecondaryText()}
      exstsText={
        (baseConfig?.extensionsText ?? shortText)
          ? shortText
          : t("Common:AnyFiles")
      }
      fullExstsText={fullText}
      formatsPlusBadgeValue={badgeValue}
      dataTestId="sdk-uploader"
      icon={UploadSvgUrl}
      className={`${styles.dropzoneWrapper} ${styles.dropzoneCentered}`}
      loaderClassName={styles.dropzoneLoader}
    />
  );
}
