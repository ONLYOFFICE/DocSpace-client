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

import { useCallback, useEffect } from "react";

import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import { Uploader } from "@docspace/ui-kit/uploader";
import type {
  UploadProgressData,
  UploaderFilesSettings,
} from "@docspace/ui-kit/uploader/Uploader.types";
import { frameCallEvent, getFrameId } from "@docspace/shared/utils/common";

import { useSDKConfig } from "@/providers/SDKConfigProvider";

export type UploaderClientProps = {
  filesSettings?: UploaderFilesSettings;
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

  useEffect(() => {
    frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
  }, []);

  const handleUploadProgress = useCallback((data: UploadProgressData) => {
    frameCallEvent({
      event: "onUploadProgress",
      data,
    });
  }, []);

  const handleUploadSuccess = useCallback((data: unknown[]) => {
    frameCallEvent({
      event: "onUploadSuccess",
      data,
    });
  }, []);

  const handleUploadError = useCallback(
    (data: { error: string; rejectedFiles?: unknown[] }) => {
      frameCallEvent({
        event: "onUploadError",
        data,
      });
    },
    [],
  );

  const getFolderUrl = (folderId: number) => {
    return `${window.location.origin}/rooms/personal/filter?folder=${folderId}`;
  };

  return (
    <Uploader
      accept={accept}
      shortText={shortText}
      fullText={fullText}
      badgeValue={badgeValue}
      filesSettings={filesSettings}
      targetId={baseConfig?.targetId}
      linkMainText={baseConfig?.linkMainText}
      secondaryText={baseConfig?.secondaryText}
      extensionsText={baseConfig?.extensionsText}
      isFolderUpload={baseConfig?.isFolderUpload}
      isMultipleUpload={baseConfig?.isMultipleUpload}
      maxPerUploadSize={baseConfig?.maxPerUploadSize}
      maxTotalUploadSize={baseConfig?.maxTotalUploadSize}
      getFolderUrl={getFolderUrl}
      onUploadProgress={handleUploadProgress}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
    />
  );
}
