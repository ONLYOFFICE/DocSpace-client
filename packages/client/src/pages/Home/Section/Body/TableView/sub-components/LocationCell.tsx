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
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TFile } from "@docspace/shared/api/files/types";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import { globalColors } from "@docspace/shared/themes";
import { Text } from "@docspace/shared/components/text";
import { getFolderPath } from "@docspace/shared/api/files";

import { StyledText } from "./CellStyles";

type TPath = {
  id: number;
  title: string;
};

type LocationCellProps = {
  sideColor?: string;
  item: TFile;
};

const LocationCell = ({ sideColor, item }: LocationCellProps) => {
  const {
    originRoomTitle,
    originId: originFolderId,
    originRoomId,
    originTitle,
    id,
  } = item;

  const { t } = useTranslation("Common");
  const [path, setPath] = useState<TPath[]>([]);
  const [isPathLoading, setIsPathLoading] = useState(false);

  const title = item.requestToken
    ? t("Common:ViaLink")
    : originRoomTitle || originTitle;
  const originId = originFolderId || originRoomId;
  const withTooltip = item.requestToken ? false : !!title;

  const getPath = useCallback(async () => {
    if (path.length || !originId || !title) return;

    setIsPathLoading(true);
    try {
      const folderPath = await getFolderPath(originId);
      setPath(folderPath);
    } catch (e) {
      console.error(e);
      setPath([{ id: 0, title }]);
    } finally {
      setIsPathLoading(false);
    }
  }, [path, originId, title]);

  return [
    <StyledText
      key="cell"
      fontSize="12px"
      fontWeight={600}
      color={sideColor}
      className="row_update-text"
      truncate
      data-tooltip-id={`${id}`}
      data-tip=""
    >
      {title || "—"}
    </StyledText>,

    withTooltip ? (
      <Tooltip
        place="bottom"
        key="tooltip"
        id={`${id}`}
        afterShow={getPath}
        getContent={() => (
          <span>
            {isPathLoading ? (
              <Loader
                color={globalColors.black}
                size="12px"
                type={LoaderTypes.track}
              />
            ) : (
              path.map((pathPart, i) => (
                <Text
                  key={pathPart.id}
                  isBold={i === 0}
                  isInline
                  fontSize="12px"
                >
                  {i === 0 ? pathPart.title : `/${pathPart.title}`}
                </Text>
              ))
            )}
          </span>
        )}
      />
    ) : null,
  ];
};

export default LocationCell;
