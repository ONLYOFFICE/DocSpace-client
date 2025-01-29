// (c) Copyright Ascensio System SIA 2009-2024
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

import { RowContainer } from "@docspace/shared/components/rows";
import FilesFilter from "@docspace/shared/api/files/filter";
import styles from "@docspace/shared/styles/FilesRowContainer.module.scss";

import useItemIcon from "../../_hooks/useItemIcon";
import useItemList, { TFileItem, TFolderItem } from "../../_hooks/useItemList";

import { Row } from "./sub-components/Row";

import { RowViewProps } from "./RowView.types";

const RowView = ({
  total,
  folders,
  files,
  shareKey,
  filesSettings,
  filesFilter,
  portalSettings,
}: RowViewProps) => {
  const { getIcon } = useItemIcon({
    filesSettings,
  });

  const { convertFileToItem, convertFolderToItem } = useItemList({
    getIcon,
    shareKey,
  });

  const [isInit, setIsInit] = React.useState(false);

  const filter = FilesFilter.getFilter({
    search: filesFilter,
  } as Location)!;

  const filterSortBy = filter.sortBy;
  const timezone = portalSettings.timezone;
  const displayFileExtension = filesSettings.displayFileExtension;

  const filesList: (TFolderItem | TFileItem)[] = [
    ...folders.map(convertFolderToItem),
    ...files.map(convertFileToItem),
  ];

  React.useEffect(() => {
    setIsInit(true);
  }, []);

  return (
    <RowContainer
      className={`files-row-container ${styles.filesRowContainer}`}
      filesLength={filesList.length}
      itemCount={total}
      hasMoreFiles={total > filesList.length}
      useReactWindow={isInit}
      fetchMoreFiles={async () => {}}
      itemHeight={58}
      onScroll={() => {}}
    >
      {filesList.map((item, index) => (
        <Row
          key={`${item.id}_${index}`}
          index={index}
          item={item}
          filterSortBy={filterSortBy}
          timezone={timezone}
          displayFileExtension={displayFileExtension}
        />
      ))}
    </RowContainer>
  );
};

export default observer(RowView);
