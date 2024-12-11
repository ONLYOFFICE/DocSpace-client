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

import React from "react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import DragAndDrop from "@docspace/shared/components/drag-and-drop/DragAndDrop";
import { Row } from "@docspace/shared/components/row";
import FilesRowContent from "./FilesRowContent";
import { isMobile, isMobileOnly } from "react-device-detect";

import {
  isMobile as isMobileUtile,
  mobile,
  tablet,
  classNames,
  injectDefaultTheme,
} from "@docspace/shared/utils";

import withFileActions from "../../../../../HOCs/withFileActions";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import withBadges from "../../../../../HOCs/withBadges";
import ItemIcon from "../../../../../components/ItemIcon";
import marginStyles from "./CommonStyles";
import { globalColors } from "@docspace/shared/themes";

import CursorPalmReactSvgUrl from "PUBLIC_DIR/images/cursor.palm.react.svg?url";

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const StyledWrapper = styled.div`
  .files-item {
    border-inline: none;
    margin-inline-start: 0;
  }
  height: 59px;
  box-sizing: border-box;

  border-bottom: ${(props) =>
    `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
  border-top: ${(props) =>
    `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
  margin-top: -1px;

  ${(props) =>
    (props.checked || props.isActive) &&
    !props.isIndexEditingMode &&
    checkedStyle};
  ${(props) =>
    (props.checked || props.isActive) &&
    props.isFirstElem &&
    css`
      border-top-color: ${(props) =>
        `${props.theme.filesSection.tableView.row.borderColor} !important`};
    `};

  ${(props) =>
    props.isIndexUpdated &&
    css`
      background: ${(props) =>
        props.isIndexEditingMode
          ? `${props.theme.filesSection.tableView.row.indexUpdate} !important`
          : `${props.theme.filesSection.tableView.row.backgroundActive} !important`};

      &:hover {
        background: ${(props) =>
          `${props.theme.filesSection.tableView.row.indexActive} !important`};
      }

      ${marginStyles}
    `}

  ${(props) =>
    !isMobile &&
    !props.isDragging &&
    !props.isIndexEditingMode &&
    css`
      :hover {
        cursor: pointer;
        ${checkedStyle}
      }
    `};

  ${(props) =>
    !isMobile &&
    props.isIndexEditingMode &&
    css`
      :hover {
        cursor: pointer;
        background: ${(props) =>
          props.theme.filesSection.tableView.row.indexActive};
        ${marginStyles}
      }
    `};

  ${(props) =>
    props.showHotkeyBorder &&
    css`
      border-color: ${globalColors.lightSecondMain} !important;
      z-index: 1;
      position: relative;

      margin-inline: -24px;
      padding-inline: 24px;
    `}

  ${(props) =>
    props.isHighlight &&
    css`
      ${marginStyles}
      animation: Highlight 2s 1;

      @keyframes Highlight {
        0% {
          background: ${(props) => props.theme.filesSection.animationColor};
        }

        100% {
          background: none;
        }
      }
    `}
`;

const StyledSimpleFilesRow = styled(Row).attrs(injectDefaultTheme)`
  height: 56px;

  position: unset;
  cursor: ${(props) =>
    !props.isThirdPartyFolder &&
    (props.checked || props.isActive) &&
    props.canDrag &&
    `url(${CursorPalmReactSvgUrl}) 8 0, auto`};
  ${(props) =>
    props.inProgress &&
    css`
      pointer-events: none;
      /* cursor: wait; */
    `}

  margin-top: 0px;

  ${(props) =>
    (!props.contextOptions || props.isEdit) &&
    `
    & > div:last-child {
        width: 0px;
        overflow: hidden;
      }
  `}

  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .styled-element {
    height: 32px;
    margin-inline-end: 12px;
  }

  .row_content {
    ${(props) =>
      props.sectionWidth > 500 && `max-width: fit-content;`}//min-width: auto
  }

  .badges {
    display: flex;
    align-items: center;

    .badge-version {
      &:hover {
        cursor: pointer;
      }
    }
  }

  .tablet-row-copy-link,
  .tablet-row-create-room {
    display: none;
  }

  @media ${tablet} {
    .tablet-row-copy-link,
    .tablet-row-create-room {
      display: block;
    }

    .row-copy-link {
      display: none;
    }
  }

  @media ${mobile} {
    .tablet-row-copy-link,
    .tablet-row-create-room {
      display: none;
    }

    .row-copy-link,
    .tablet-row-create-room {
      display: block;

      ${isMobileOnly &&
      css`
        :hover {
          svg path {
            fill: ${({ theme }) => theme.iconButton.color};
          }
        }
      `}
    }
  }

  .favorite {
    cursor: pointer;
    margin-top: 1px;
  }

  .row_context-menu-wrapper {
    width: min-content;
    justify-content: space-between;
    flex: 0 1 auto;
  }

  .row_content {
    max-width: none;
    min-width: 0;
  }

  .badges {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .temp-badges {
    margin-top: 0px;
  }

  .lock-file {
    cursor: ${(props) => (props.withAccess ? "pointer" : "default")};
    svg {
      height: 16px;
    }
  }

  .expandButton {
    margin-inline-start: ${(props) =>
      !props.folderCategory ? "17px" : "24px"};
    padding-top: 0px;
  }
  .expandButton > div:first-child {
    ${(props) => props.folderCategory && `padding-inline-start: 0 !important;`}
  }

  .badges {
    flex-direction: row-reverse;
    gap: 24px;
  }

  .file__badges,
  .room__badges,
  .folder__badges {
    margin-top: 0px;

    > div {
      margin-top: 0px;
      margin-inline: 0;
    }
  }

  @media ${mobile} {
    .lock-file {
      svg {
        height: 12px;
      }
    }

    .badges {
      gap: 8px;
    }

    /* .badges__quickButtons:not(:empty) {
      margin-inline-start: 8px;
    } */
    .room__badges:empty,
    .file__badges:empty,
    .folder__badges:empty,
    .badges__quickButtons:empty {
      display: none;
    }

    .badges,
    .folder__badges,
    .room__badges,
    .file__badges {
      margin-top: 0px;
      align-items: center;
      height: 100%;
    }

    .room__badges,
    .folder__badges {
      > div {
        margin-top: 0px;
      }
    }
  }
`;

const SimpleFilesRow = (props) => {
  const {
    t,
    item,
    sectionWidth,
    dragging,
    onContentFileSelect,
    fileContextClick,
    onDrop,
    onMouseDown,
    className,
    isDragging,
    value,
    quickButtonsComponent,
    displayShareButton,
    isPrivacy,
    checkedProps,
    onFilesClick,
    onDoubleClick,
    onMouseClick,
    isEdit,
    isActive,
    inProgress,
    isAdmin,
    getContextModel,
    showHotkeyBorder,
    id,
    isRooms,
    folderCategory,
    isHighlight,
    badgesComponent,
    onDragOver,
    onDragLeave,
    itemIndex,
    badgeUrl,
    canDrag,
    isIndexEditingMode,
    changeIndex,
    isIndexUpdated,
    isFolder,
    icon,
    isDownload,
    additionalInfo,
  } = props;

  const isMobileDevice = isMobileUtile();

  const [isDragActive, setIsDragActive] = React.useState(false);

  const withAccess = item.security?.Lock;
  const isSmallContainer = sectionWidth <= 500;

  const onChangeIndex = (action) => {
    return changeIndex(action, item, t);
  };

  const element = (
    <ItemIcon
      id={item.id}
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      title={item.title}
      logo={item.logo}
      showDefault={
        !(!!item?.logo?.cover || !!item?.logo?.medium) && item.isRoom
      }
      color={item.logo?.color}
      isArchive={item.isArchive}
      isTemplate={item.isTemplate}
      badgeUrl={badgeUrl}
    />
  );

  const onDragOverEvent = (dragActive, e) => {
    onDragOver && onDragOver(e);

    if (dragActive !== isDragActive) {
      setIsDragActive(dragActive);
    }
  };

  const onDragLeaveEvent = (e) => {
    onDragLeave && onDragLeave(e);

    setIsDragActive(false);
  };

  const dragStyles =
    dragging && isDragging
      ? {
          marginInline: "-16px",
          paddingInline: "16px",
        }
      : {};

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : (item.id ?? "");

  return (
    <StyledWrapper
      id={id}
      onDragOver={onDragOver}
      className={`row-wrapper ${
        showHotkeyBorder
          ? "row-hotkey-border"
          : checkedProps || isActive
            ? "row-selected"
            : ""
      }`}
      checked={checkedProps}
      isActive={isActive}
      showHotkeyBorder={showHotkeyBorder}
      isIndexEditingMode={isIndexEditingMode}
      isIndexUpdated={isIndexUpdated}
      isFirstElem={itemIndex === 0}
      isHighlight={isHighlight}
    >
      <DragAndDrop
        data-title={item.title}
        value={value}
        className={classNames("files-item", className, idWithFileExst)}
        onDrop={onDrop}
        onMouseDown={onMouseDown}
        dragging={dragging && isDragging}
        onDragOver={onDragOverEvent}
        onDragLeave={onDragLeaveEvent}
        style={dragStyles}
      >
        <StyledSimpleFilesRow
          key={item.id}
          data={item}
          isEdit={isEdit}
          element={element}
          mode={"modern"}
          sectionWidth={sectionWidth}
          contentElement={
            isMobileDevice || isRooms ? null : quickButtonsComponent
          }
          badgesComponent={
            (!isMobileDevice || item.isTemplate) && badgesComponent
          }
          onSelect={onContentFileSelect}
          onContextClick={fileContextClick}
          isPrivacy={isPrivacy}
          onClick={onMouseClick}
          onDoubleClick={onDoubleClick}
          checked={checkedProps}
          contextOptions={item.contextOptions}
          contextButtonSpacerWidth={displayShareButton}
          dragging={dragging && isDragging}
          isDragging={dragging}
          isIndexEditingMode={isIndexEditingMode}
          onChangeIndex={onChangeIndex}
          isActive={isActive}
          inProgress={
            inProgress && isFolder
              ? icon !== "duplicate" && icon !== "duplicate-room" && !isDownload
              : inProgress
          }
          isThirdPartyFolder={item.isThirdPartyFolder}
          className="files-row"
          withAccess={withAccess}
          getContextModel={getContextModel}
          isRoom={item.isRoom}
          isArchive={item.isArchive}
          isDragOver={isDragActive}
          isSmallContainer={isSmallContainer}
          isRooms={isRooms}
          folderCategory={folderCategory}
          withoutBorder={true}
          isHighlight={isHighlight}
          badgeUrl={badgeUrl}
          canDrag={canDrag}
          isFolder={isFolder}
        >
          <FilesRowContent
            item={item}
            additionalInfo={additionalInfo}
            sectionWidth={sectionWidth}
            onFilesClick={onFilesClick}
            quickButtons={
              isMobileDevice || isRooms ? quickButtonsComponent : null
            }
            isRooms={isRooms}
            badgesComponent={
              isMobileDevice && !item.isTemplate && badgesComponent
            }
          />
        </StyledSimpleFilesRow>
      </DragAndDrop>
    </StyledWrapper>
  );
};

export default withTranslation([
  "Files",
  "Translations",
  "InfoPanel",
  "Notifications",
])(withFileActions(withQuickButtons(withBadges(SimpleFilesRow))));
