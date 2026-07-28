/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Text } from "@docspace/ui-kit/components/text";
import { getFolderPath } from "@docspace/shared/api/files";

import type { TableItem } from "../columns";
import styles from "../TableView.module.scss";

type TPath = { id: number; title: string };

type LocationCellProps = {
  item: TableItem;
};

// Original location for Favorites / Recent / Trash. Shows the origin room or
// folder title, with a hover tooltip that lazy-loads the full breadcrumb path
// (mirrors the client LocationCell). The path fetch reuses the shared
// getFolderPath, which runs client-side.
const LocationCell = ({ item }: LocationCellProps) => {
  const { t } = useTranslation(["Common"]);
  const [path, setPath] = React.useState<TPath[]>([]);
  const [isPathLoading, setIsPathLoading] = React.useState(false);

  const originRoomTitle = "originRoomTitle" in item ? item.originRoomTitle : "";
  const originTitle = "originTitle" in item ? item.originTitle : "";
  const originFolderId = "originId" in item ? item.originId : undefined;
  const originRoomId = "originRoomId" in item ? item.originRoomId : undefined;
  const requestToken = "requestToken" in item ? item.requestToken : undefined;

  const title = requestToken
    ? t("Common:ViaLink")
    : originRoomTitle || originTitle;
  const originId = originFolderId || originRoomId;
  const withTooltip = requestToken ? false : !!title;
  const tooltipId = `location-${item.id}`;

  const getPath = React.useCallback(async () => {
    if (path.length || !originId || !title) return;

    setIsPathLoading(true);
    try {
      const folderPath = (await getFolderPath(originId)) as TPath[];
      setPath(folderPath);
    } catch (e) {
      console.error(e);
      setPath([{ id: 0, title }]);
    } finally {
      setIsPathLoading(false);
    }
  }, [path.length, originId, title]);

  return (
    <>
      <Text
        fontSize="12px"
        fontWeight={600}
        className={styles.secondaryCell}
        truncate
        data-tooltip-id={withTooltip ? tooltipId : undefined}
        data-tip=""
      >
        {title || "—"}
      </Text>

      {withTooltip ? (
        <Tooltip
          place="bottom"
          id={tooltipId}
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
                  <Text key={pathPart.id} isBold={i === 0} isInline fontSize="12px">
                    {i === 0 ? pathPart.title : `/${pathPart.title}`}
                  </Text>
                ))
              )}
            </span>
          )}
        />
      ) : null}
    </>
  );
};

export default React.memo(LocationCell);
