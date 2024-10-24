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
import { useState } from "react";
import { Trans, withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

import { IconButton } from "@docspace/shared/components/icon-button";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { ReactSVG } from "react-svg";
import { TTranslation } from "@docspace/shared/types";
import { getFileExtension } from "@docspace/shared/utils/common";
import config from "PACKAGE_FILE";
import {
  StyledHistoryBlockExpandLink,
  StyledHistoryBlockFile,
  StyledHistoryBlockFilesList,
} from "../../../styles/history";

import { ActionByTarget, FeedAction } from "../FeedInfo";
import { Feed } from "./HistoryBlockContent.types";

const EXPANSION_THRESHOLD = 3;

type HistoryItemListProps = {
  t: TTranslation;
  feed: Feed;

  nameWithoutExtension?: (title: string) => string;
  getInfoPanelItemIcon?: (item: any, size: number) => string;
  checkAndOpenLocationAction?: (item: any, actionType: string) => void;
} & (
  | {
      actionType: ActionByTarget<"file">;
      targetType: "file";
    }
  | {
      actionType: ActionByTarget<"folder">;
      targetType: "folder";
    }
);

const HistoryItemList = ({
  t,
  feed,
  actionType,
  targetType,
  nameWithoutExtension,
  getInfoPanelItemIcon,
  checkAndOpenLocationAction,
}: HistoryItemListProps) => {
  const totalItems = feed.related.length + 1;
  const isExpandable = totalItems > EXPANSION_THRESHOLD;
  const [isExpanded, setIsExpanded] = useState(!isExpandable);

  const isStartedFilling = actionType === FeedAction.StartedFilling;
  const isSubmitted = actionType === FeedAction.Submitted;

  const onExpand = () => setIsExpanded(true);

  const isFolder = targetType === "folder";

  const items = [
    feed.data,
    ...feed.related.map((relatedFeeds) => relatedFeeds.data),
  ].map((item) => {
    return {
      ...item,
      title: nameWithoutExtension!(item.title || item.newTitle),
      fileExst: getFileExtension(item.title || item.newTitle),
      isFolder,
    };
  });

  const oldItem = actionType === "rename" && {
    title: nameWithoutExtension!(feed.data.oldTitle),
    fileExst: getFileExtension(feed.data.oldTitle),
  };

  const isDisabledOpenLocationButton = !(isStartedFilling || isSubmitted);

  const handleOpenFile = (item) => {
    const isMedia =
      item.accessibility.ImageView || item.accessibility.MediaView;

    if (isMedia) {
      return window.open(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          config.homepage,
          MEDIA_VIEW_URL,
          item.id,
        ),
      );
    }

    return (
      !isFolder &&
      window.open(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          config.homepage,
          `/doceditor?fileId=${item.id}`,
        ),
      )
    );
  };

  return (
    <StyledHistoryBlockFilesList>
      {items.map((item, i) => {
        if (!isExpanded && i > EXPANSION_THRESHOLD - 1) return null;
        return (
          <>
            <StyledHistoryBlockFile
              isRoom={false}
              isFolder={item.isFolder}
              key={`${feed.action.id}_${item.id}`}
            >
              <div
                className="item-wrapper"
                onClick={() => handleOpenFile(item)}
              >
                <ReactSVG
                  className="icon"
                  src={getInfoPanelItemIcon!(item, 24)}
                />
                <div className="item-title">
                  {item.title ? (
                    <>
                      <span className="name" key="hbil-item-name">
                        {item.title}
                      </span>
                      {item.fileExst && (
                        <span className="exst" key="hbil-item-exst">
                          {item.fileExst}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="name">{item.fileExst}</span>
                  )}
                </div>
              </div>
              {isDisabledOpenLocationButton && (
                <IconButton
                  className="location-btn"
                  iconName={FolderLocationReactSvgUrl}
                  size={16}
                  isFill
                  onClick={() => checkAndOpenLocationAction!(item, actionType)}
                  title={t("Files:OpenLocation")}
                />
              )}
            </StyledHistoryBlockFile>

            {actionType === "rename" && oldItem && (
              <StyledHistoryBlockFile>
                <div className="old-item-wrapper">
                  <ReactSVG
                    className="icon"
                    src={getInfoPanelItemIcon!(item, 24)}
                  />
                  <div className="item-title old-item-title">
                    {oldItem.title ? (
                      <>
                        <span className="name" key="hbil-item-name">
                          {oldItem.title}
                        </span>
                        {oldItem.fileExst && (
                          <span className="exst" key="hbil-item-exst">
                            {oldItem.fileExst}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="name">{oldItem.fileExst}</span>
                    )}
                  </div>
                </div>
              </StyledHistoryBlockFile>
            )}
          </>
        );
      })}
      {isExpandable && !isExpanded && (
        <StyledHistoryBlockExpandLink
          className="files-list-expand-link"
          onClick={onExpand}
        >
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="AndMoreLabel"
            values={{ count: items.length - EXPANSION_THRESHOLD }}
            components={{ 1: <strong /> }}
          />
        </StyledHistoryBlockExpandLink>
      )}
    </StyledHistoryBlockFilesList>
  );
};

export default inject<TStore>(({ infoPanelStore, filesActionsStore }) => {
  const { getInfoPanelItemIcon } = infoPanelStore;
  const { nameWithoutExtension, checkAndOpenLocationAction } =
    filesActionsStore;

  return {
    getInfoPanelItemIcon,
    nameWithoutExtension,
    checkAndOpenLocationAction,
  };
})(
  withTranslation(["InfoPanel", "Common", "Translations"])(
    observer(HistoryItemList),
  ),
);
