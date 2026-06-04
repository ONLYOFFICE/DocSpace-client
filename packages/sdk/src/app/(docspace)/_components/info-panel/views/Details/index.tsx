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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { FileType, FolderType } from "@docspace/shared/enums";
import { createThumbnails } from "@docspace/shared/api/files";
import { isAdmin } from "@docspace/shared/utils/common";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import { useDocsSettingsStore } from "@/app/(personal-files)/_store/DocsSettingsStore";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import RoomLogoEditableIcon from "@/app/(rooms)/_components/room-logo-editor";

import DetailsHelper, { type DetailsProperty } from "./Details.utils";

import commonStyles from "../../helpers/Common.module.scss";
import styles from "./Details.module.scss";

type DetailsProps = {
  selection: TFile | TFolder;
  onTagsChanged?: () => void;
};

const Details = observer(({ selection, onTagsChanged }: DetailsProps) => {
  const { t, i18n } = useTranslation(["Common"]);

  const docsSettingsStore = useDocsSettingsStore();
  const { getIcon } = useItemIcon({
    filesSettings: docsSettingsStore.filesSettings ?? undefined,
  });

  const { user } = useDocsUserStore();
  const { rootFolderType } = useFilesListStore();
  const canManageTags =
    !!(user && isAdmin(user)) && rootFolderType !== FolderType.Archive;

  const [itemProperties, setItemProperties] = React.useState<DetailsProperty[]>(
    [],
  );
  const [isThumbnailError, setIsThumbnailError] = React.useState(false);

  React.useEffect(() => {
    const helper = new DetailsHelper({
      t,
      item: selection,
      culture: i18n.language,
      tagListClassName: styles.tagList,
      onTagsChanged,
      canManageTags,
    });
    setItemProperties(helper.getPropertyList());

    if (
      "isFolder" in selection &&
      !selection.isFolder &&
      "thumbnailStatus" in selection &&
      selection.thumbnailStatus === 0 &&
      "fileType" in selection &&
      (selection.fileType === FileType.Image ||
        selection.fileType === FileType.Spreadsheet ||
        selection.fileType === FileType.Presentation ||
        selection.fileType === FileType.Document)
    ) {
      createThumbnails([Number(selection.id)]).catch((e) => {
        console.error("createThumbnails failed", e);
      });
    }

    setIsThumbnailError(false);
  }, [selection, t, i18n.language, canManageTags]);

  const onThumbnailError = () => setIsThumbnailError(true);

  const isFolder = "isFolder" in selection && selection.isFolder;
  const isRoom = "isRoom" in selection && Boolean(selection.isRoom);
  const fileExst = "fileExst" in selection ? selection.fileExst : "";

  const iconUrl =
    "thumbnailUrl" in selection && selection.thumbnailUrl && !isThumbnailError
      ? null
      : getIcon(isFolder ? undefined : fileExst, 96);

  return (
    <>
      {isRoom ? (
        <div className={styles.noThumbnail}>
          <RoomLogoEditableIcon
            selection={selection as TFolder}
            variant="details"
            onUpdated={onTagsChanged}
          />
        </div>
      ) : "thumbnailUrl" in selection &&
        selection.thumbnailUrl &&
        !isThumbnailError ? (
        <div className={styles.thumbnail}>
          {/* biome-ignore lint/performance/noImgElement: authenticated same-origin thumbnail with immutable caching; next/image proxy is not applicable */}
          <img
            src={`${selection.thumbnailUrl}&size=3840x2160`}
            alt="thumbnail-image"
            onError={onThumbnailError}
          />
        </div>
      ) : (
        <div className={styles.noThumbnail}>
          {iconUrl ? (
            // biome-ignore lint/performance/noImgElement: static SVG via image-helpers
            <img src={iconUrl} alt="file-icon" />
          ) : null}
        </div>
      )}
      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Common:Properties")}
        </Text>
      </div>
      <div className={commonStyles.properties}>
        {itemProperties.map((property) => (
          <div
            id={property.id}
            key={property.id}
            className="property"
            data-testid={`info_panel_details_${property.id}`}
          >
            <Text className="property-title">{property.title}</Text>
            {property.content}
          </div>
        ))}
      </div>
    </>
  );
});

export default Details;

