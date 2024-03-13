import React, { useEffect } from "react";
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
} from "@docspace/shared/utils";

import withFileActions from "../../../../../HOCs/withFileActions";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import withBadges from "../../../../../HOCs/withBadges";
import ItemIcon from "../../../../../components/ItemIcon";
import marginStyles from "./CommonStyles";
import { Base } from "@docspace/shared/themes";

import CursorPalmReactSvgUrl from "PUBLIC_DIR/images/cursor.palm.react.svg?url";

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const StyledWrapper = styled.div`
  .files-item {
    border-left: none;
    border-right: none;
    margin-left: 0;
  }
  height: 59px;
  box-sizing: border-box;

  border-bottom: ${(props) =>
    `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
  border-top: ${(props) =>
    `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
  margin-top: -1px;

  ${(props) => (props.checked || props.isActive) && checkedStyle};
  ${(props) =>
    (props.checked || props.isActive) &&
    props.isFirstElem &&
    css`
      border-top-color: ${(props) =>
        `${props.theme.filesSection.tableView.row.borderColor} !important`};
    `};

  ${(props) =>
    !isMobile &&
    !props.isDragging &&
    css`
      :hover {
        cursor: pointer;
        ${checkedStyle}
      }
    `};

  ${(props) =>
    props.showHotkeyBorder &&
    css`
      border-color: #2da7db !important;
      z-index: 1;
      position: relative;

      margin-left: -24px;
      margin-right: -24px;
      padding-left: 24px;
      padding-right: 24px;
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

const StyledSimpleFilesRow = styled(Row)`
  height: 56px;

  position: unset;
  cursor: ${(props) =>
    !props.isThirdPartyFolder &&
    (props.checked || props.isActive) &&
    props.canDrag &&
    `url(${CursorPalmReactSvgUrl}), auto`};
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

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .styled-element {
    height: 32px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 7px;
          `
        : css`
            margin-right: 7px;
          `}
  }

  .row_content {
    ${(props) =>
      props.sectionWidth > 500 && `max-width: fit-content;`}//min-width: auto
  }

  .badges {
    display: flex;
    align-items: center;
  }

  .lock-file {
    cursor: ${(props) => (props.withAccess ? "pointer" : "default")};
    svg {
      height: 12px;
    }
  }

  .tablet-row-copy-link {
    display: none;
  }

  @media ${tablet} {
    .tablet-row-copy-link {
      display: block;
    }

    .row-copy-link {
      display: none;
    }
  }

  @media ${mobile} {
    .tablet-row-copy-link {
      display: none;
    }

    .row-copy-link {
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
    svg {
      height: 16px;
    }
  }

  .expandButton {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: ${(props) =>
              !props.folderCategory ? "17px" : "24px"};
          `
        : css`
            margin-left: ${(props) =>
              !props.folderCategory ? "17px" : "24px"};
          `}
    padding-top: 0px;
  }
  .expandButton > div:first-child {
    ${(props) =>
      props.folderCategory &&
      css`
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding-right: 0 !important;
              `
            : css`
                padding-left: 0 !important;
              `}
      `}
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
      margin-left: 0;
      margin-right: 0;
    }
  }

  @media ${mobile} {
    .badges {
      gap: 8px;
    }

    .badges__quickButtons:not(:empty) {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
    }
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

StyledSimpleFilesRow.defaultProps = { theme: Base };

const SimpleFilesRow = (props) => {
  const {
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
  } = props;

  const isMobileDevice = isMobileUtile();

  const [isDragActive, setIsDragActive] = React.useState(false);

  const withAccess = item.security?.Lock;
  const isSmallContainer = sectionWidth <= 500;

  const element = (
    <ItemIcon
      id={item.id}
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      title={item.title}
      logo={item.logo}
      color={item.logo?.color}
      isArchive={item.isArchive}
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
          marginLeft: "-16px",
          marginRight: "-16px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }
      : {};

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : item.id ?? "";

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
          badgesComponent={!isMobileDevice && badgesComponent}
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
          isActive={isActive}
          inProgress={inProgress}
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
        >
          <FilesRowContent
            item={item}
            sectionWidth={sectionWidth}
            onFilesClick={onFilesClick}
            quickButtons={
              isMobileDevice || isRooms ? quickButtonsComponent : null
            }
            isRooms={isRooms}
            badgesComponent={isMobileDevice && badgesComponent}
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
