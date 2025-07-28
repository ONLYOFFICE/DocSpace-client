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

import { Loader } from "@docspace/shared/components/loader";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Text } from "@docspace/shared/components/text";
import React, { useState } from "react";
import { getFolderPath } from "@docspace/shared/api/files";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { globalColors } from "@docspace/shared/themes";
import { StyledText } from "./CellStyles";

const RoomCell = ({ sideColor, item, isRecentFolder }) => {
  const { originRoomTitle, originId, originTitle } = item;

  const [path, setPath] = useState([]);
  const [isTooltipLoading, setIsTooltipLoading] = useState(false);

  const getPath = async () => {
    if (path.length) return;

    setIsTooltipLoading(true);
    try {
      const folderPath = await getFolderPath(originId);
      if (folderPath[0].id === CategoryType.SharedRoom) folderPath.shift();
      setPath(folderPath);
    } catch (e) {
      console.error(e);
      setPath([{ id: 0, title: originRoomTitle || originTitle }]);
    } finally {
      setIsTooltipLoading(false);
    }
  };

  const canVisibleTitle = originRoomTitle || originTitle;
  const emptyTitle = isRecentFolder ? "—" : "";
  const showTooltip = isRecentFolder ? canVisibleTitle : true;

  return [
    <StyledText
      key="cell"
      fontSize={canVisibleTitle ? "12px" : "13px"}
      fontWeight={600}
      color={sideColor}
      className="row_update-text"
      truncate
      data-tooltip-id={`${item.id}`}
      data-tip=""
    >
      {originRoomTitle || originTitle || emptyTitle}
    </StyledText>,

    showTooltip ? (
      <Tooltip
        place="bottom"
        key="tooltip"
        id={`${item.id}`}
        afterShow={getPath}
        getContent={() => (
          <span>
            {isTooltipLoading ? (
              <Loader color={globalColors.black} size="12px" type="track" />
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

export default RoomCell;
