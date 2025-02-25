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

import React from "react";
import classNames from "classnames";

import { RectangleSkeleton } from "../rectangle";

import { TileSkeleton } from "./Tile";
import type { TilesSkeletonProps } from "./Tiles.types";
import styles from "./Tiles.module.scss";

export const TilesSkeleton = ({
  foldersCount = 2,
  filesCount = 8,
  withTitle = true,
  isRooms = false,
  ...rest
}: TilesSkeletonProps) => {
  const folders = [];
  const files = [];

  for (let i = 0; i < foldersCount; i += 1) {
    folders.push(<TileSkeleton isFolder key={`tile-loader-${i}`} {...rest} />);
  }

  for (let i = 0; i < filesCount; i += 1) {
    files.push(<TileSkeleton key={`files-loader-${i}`} {...rest} />);
  }

  const tilesClassNames = classNames(styles.tilesSkeleton, {
    [styles.tilesSkeletonRooms]: isRooms,
  });

  return (
    <div className={styles.tilesWrapper}>
      {foldersCount > 0 ? (
        <RectangleSkeleton
          height="22px"
          width="78px"
          className="folders"
          animate
          {...rest}
        />
      ) : null}
      <div className={tilesClassNames}>{folders}</div>

      {filesCount > 0
        ? withTitle && (
            <RectangleSkeleton
              height="22px"
              width="103px"
              className="files"
              animate
              {...rest}
            />
          )
        : null}
      <div className={tilesClassNames}>{files}</div>
    </div>
  );
};
