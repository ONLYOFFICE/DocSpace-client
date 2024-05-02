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

import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder-location.react.svg?url";
import React, { useState } from "react";
import { Trans } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { ReactSVG } from "react-svg";
import {
  StyledHistoryBlockFile,
  StyledHistoryBlockFilesList,
} from "../../styles/history";
import { RoomsType } from "@docspace/shared/enums";

export const HistoryBlockItemList = ({
  t,
  items,
  getInfoPanelItemIcon,
  checkAndOpenLocationAction,
}) => {
  const [isShowMore, setIsShowMore] = useState(items.length <= 3);
  const onShowMore = () => setIsShowMore(true);

  const parsedItems = items.map((item) => {
    const indexPoint = item.Title.lastIndexOf(".");
    const splitTitle = item.Title.split(".");
    const splitTitleLength = splitTitle.length;

    const fileExst =
      splitTitleLength !== 1 ? `.${splitTitle[splitTitleLength - 1]}` : null;

    const title =
      splitTitleLength <= 2 ? splitTitle[0] : item.Title.slice(0, indexPoint);

    return {
      ...item,
      isRoom: item.Item === "room",
      isFolder: item.Item === "folder",
      roomType: RoomsType[item.AdditionalInfo],
      title,
      fileExst,
      id: item.ItemId.split("_")[0],
      viewUrl: item.itemId,
    };
  });

  // If server returns two instances of the same item by mistake filters it out
  const includedIds = [];
  const filteredParsedItems = parsedItems.filter((item) => {
    if (includedIds.indexOf(item.id) > -1) return false;
    includedIds.push(item.id);
    return true;
  });

  return (
    <StyledHistoryBlockFilesList>
      {filteredParsedItems.map((item, i) => {
        includedIds.push(item);
        if (!isShowMore && i > 2) return null;
        return (
          <StyledHistoryBlockFile isRoom={item.isRoom} key={item.id + "__" + i}>
            <ReactSVG className="icon" src={getInfoPanelItemIcon(item, 24)} />
            <div className="item-title">
              {item.title ? (
                [
                  <span className="name" key="hbil-item-name">
                    {item.title}
                  </span>,
                  item.fileExst && (
                    <span className="exst" key="hbil-item-exst">
                      {item.fileExst}
                    </span>
                  ),
                ]
              ) : (
                <span className="name">{item.fileExst}</span>
              )}
            </div>
            <IconButton
              className="location-btn"
              iconName={FolderLocationReactSvgUrl}
              size="16"
              isFill={true}
              onClick={() => checkAndOpenLocationAction(item)}
              title={t("Files:OpenLocation")}
            />
          </StyledHistoryBlockFile>
        );
      })}
      {!isShowMore && (
        <Text className="show_more-link" onClick={onShowMore}>
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="AndMoreLabel"
            values={{ count: items.length - 3 }}
            components={{ bold: <strong /> }}
          />
        </Text>
      )}
    </StyledHistoryBlockFilesList>
  );
};

export default HistoryBlockItemList;
