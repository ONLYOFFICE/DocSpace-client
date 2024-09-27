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

import { Checkbox } from "@docspace/shared/components/checkbox";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import PropTypes from "prop-types";
import React from "react";
import { ReactSVG } from "react-svg";
import styled, { css } from "styled-components";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { tablet, isMobile as isMobileUtils } from "@docspace/shared/utils";
import { isMobile } from "react-device-detect";
import { withTheme } from "styled-components";
import { Link } from "@docspace/shared/components/link";
import { Loader } from "@docspace/shared/components/loader";
import { Base, globalColors } from "@docspace/shared/themes";
import { Tags } from "@docspace/shared/components/tags";
import { Tag } from "@docspace/shared/components/tag";
import { getRoomTypeName } from "SRC_DIR/helpers/filesUtils";

const svgLoader = () => <div style={{ width: "96px" }} />;

const FlexBoxStyles = css`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  justify-content: flex-start;
  align-items: center;
  align-content: center;
`;

const roomsStyles = css`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  justify-content: flex-start;
  align-items: center;
  align-content: center;

  .room-tile_top-content {
    width: 100%;
    height: 64px;

    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    justify-content: flex-start;
    align-items: center;
    align-content: center;

    border-bottom: ${(props) => props.theme.filesSection.tilesView.tile.border};
    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundColor};

    border-radius: ${({ theme, isRooms }) =>
      isRooms
        ? theme.filesSection.tilesView.tile.roomsUpperBorderRadius
        : theme.filesSection.tilesView.tile.upperBorderRadius};
  }

  .room-tile_bottom-content {
    display: ${(props) => props.isThirdParty && "flex"};
    width: 100%;
    height: 56px;

    box-sizing: border-box;

    padding: 16px;
    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundColor};
    border-radius: ${({ theme, isRooms }) =>
      isRooms
        ? theme.filesSection.tilesView.tile.roomsBottomBorderRadius
        : theme.filesSection.tilesView.tile.bottomBorderRadius};
  }
`;

const FolderStyles = css`
  height: ${(props) => (props.isRoom ? "120px" : "64px")};
`;

const FileStyles = css`
  height: 220px;
`;

const checkedStyle = css`
  background: ${({ theme, isRooms }) =>
    isRooms
      ? theme.filesSection.tilesView.tile.roomsCheckedColor
      : theme.filesSection.tilesView.tile.checkedColor};
`;

const bottomFileBorder = css`
  border-top: ${(props) => props.theme.filesSection.tilesView.tile.border};
  border-radius: 0 0 6px 6px;
`;

const animationStyles = css`
  animation: Highlight 2s 1;

  @keyframes Highlight {
    0% {
      background: ${(props) => props.theme.filesSection.animationColor};
    }

    100% {
      background: none;
    }
  }
`;

const StyledTile = styled.div`
  cursor: ${(props) =>
    !props.isRecycleBin && !props.isArchiveFolder ? "pointer" : "default"};
  ${(props) =>
    props.inProgress &&
    css`
      pointer-events: none;
      /* cursor: wait; */
    `}
  box-sizing: border-box;
  width: 100%;
  border: ${(props) => props.theme.filesSection.tilesView.tile.border};

  border-radius: ${({ isRooms, theme }) =>
    isRooms
      ? theme.filesSection.tilesView.tile.roomsBorderRadius
      : theme.filesSection.tilesView.tile.borderRadius};
  ${(props) =>
    props.showHotkeyBorder && `border-color: ${globalColors.lightSecondMain}`};
  ${(props) =>
    props.isFolder && !props.isRooms && "border-start-start-radius: 6px;"}
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  ${(props) => props.isFolder && (props.isRoom ? roomsStyles : FlexBoxStyles)};
  ${(props) => (props.isFolder ? FolderStyles : FileStyles)};
  ${(props) =>
    !props.isEdit &&
    props.isFolder &&
    (props.checked || props.isActive) &&
    css`
      .room-tile_top-content {
        ${checkedStyle}
      }
      ${checkedStyle}
    `};

  :hover {
    .room-tile_top-content {
      ${checkedStyle}
    }
  }

  ${(props) =>
    !props.isDragging &&
    !isMobile &&
    css`
      :hover {
        ${checkedStyle}
        .file-tile-bottom {
          ${bottomFileBorder}
        }
      }
    `}

  ${(props) =>
    props.isHighlight &&
    css`
      .file-tile-bottom {
        ${animationStyles}
      }
    `}

  &:before,
  &:after {
    ${(props) =>
      props.showHotkeyBorder &&
      `border-color: ${globalColors.lightSecondMain}`};
  }

  &:before,
  &:after {
    ${(props) => (props.checked || props.isActive) && checkedStyle};
  }

  .checkbox {
    display: flex;
    opacity: ${(props) => (props.checked ? 1 : 0)};
    flex: 0 0 16px;
    justify-content: center;

    @media ${tablet} {
      opacity: 1;
    }
  }

  .file-checkbox {
    display: ${(props) => (props.checked ? "flex" : "none")};
    flex: 0 0 16px;
    padding-top: 8px;
    padding-inline-start: ${(props) => (props.isFolder ? "8px" : "7px")};
  }

  .file-icon {
    display: ${(props) => (props.checked ? "none" : "flex")};
    flex: 0 0 auto;
    user-select: none;
    margin-top: ${(props) => (props.isFolder ? "0" : "-2px")};
  }

  .file-icon_container {
    width: 32px;
    height: 32px;
    margin-inline-start: ${(props) =>
      props.isFolder ? (props.isRoom ? "16px" : "15px") : "16px"};
    margin-inline-end: ${(props) =>
      props.isFolder ? (props.isRoom ? "12px" : "7px") : "8px"};
  }

  .tile-folder-loader {
    padding-top: 16px;
    width: 32px;
    height: 32px;
    margin-inline: 21px 14px;
  }

  .file-icon_container:hover {
    ${(props) =>
      !props.dragging &&
      !props.inProgress &&
      !isMobile &&
      css`
        .checkbox {
          opacity: 1;
        }
        .file-checkbox {
          display: flex;
        }
        .file-icon {
          display: none;
        }
      `}
  }

  .new-items {
    min-width: 16px;
  }

  ${(props) =>
    props.isHighlight &&
    css`
      ${animationStyles}
    `}
`;

const StyledFileTileTop = styled.div`
  ${FlexBoxStyles};
  background: ${(props) =>
    props.theme.filesSection.tilesView.tile.backgroundColorTop};
  justify-content: space-between;
  align-items: baseline;
  height: 156px;
  position: relative;
  border-radius: 6px 6px 0 0;

  .thumbnail-image {
    pointer-events: none;
    position: absolute;
    height: 100%;
    width: 100%;
    object-fit: ${(props) => (props.thumbnails1280x720 ? "cover" : "none")};
    object-position: ${(props) => (props.isImageOrMedia ? "center" : "top")};
    z-index: 0;
    border-radius: 6px 6px 0 0;
  }

  .temporary-icon > div > .injected-svg {
    position: absolute;
    width: 100%;
    bottom: 16px;
  }

  ${(props) =>
    props.isPlugin &&
    css`
      .temporary-icon {
        svg {
          width: 96px;
          height: 96px;
        }
      }
    `}

  ${(props) =>
    props.isHighlight &&
    css`
      ${animationStyles}
    `}
`;

const StyledFileTileBottom = styled.div`
  ${FlexBoxStyles};
  ${(props) =>
    !props.isEdit && (props.checked || props.isActive) && checkedStyle}

  border-top: 1px solid transparent;

  ${(props) =>
    !props.isEdit && (props.checked || props.isActive) && bottomFileBorder}

  padding: 9px 0;
  height: 62px;
  box-sizing: border-box;

  .tile-file-loader {
    padding-top: 16px;
    width: 32px;
    height: 32px;
    margin-inline: 23px 14px;
  }
`;

const StyledContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-basis: 100%;

  a {
    display: block;
    display: -webkit-box;
    max-width: 400px;
    height: auto;
    margin: 0 auto;
    line-height: 19px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
  }

  .new-items {
    margin-inline-start: 12px;
  }

  .badges {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 12px;

    :not(:empty) {
      margin-inline-start: 12px;
    }

    > div {
      margin: 0;
    }
  }

  @media ${tablet} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledElement = styled.div`
  flex: 0 0 auto;
  display: flex;
  margin-inline-end: ${(props) => (props.isRoom ? "8px" : "4px")};
  user-select: none;
  margin-top: 3px;

  height: 32px;
  width: 32px;
`;

const StyledOptionButton = styled.div`
  display: block;

  .expandButton > div:first-child {
    padding-block: 8px;
    padding-inline: 12px 21px;
  }
`;

StyledOptionButton.defaultProps = { theme: Base };

const badgesPosition = css`
  inset-inline-start: 9px;

  .badges {
    display: grid;
    grid-template-columns: repeat(3, fit-content(60px));
    grid-template-rows: 32px;
    grid-gap: 7px;

    .badge-new-version {
      order: 1;

      &:hover {
        cursor: pointer;
      }
    }

    .badge-version-current {
      order: 2;
    }

    .is-editing,
    .can-convert {
      order: 3;
    }
  }
`;

const quickButtonsPosition = css`
  inset-inline-end: 9px;

  .badges {
    display: grid;
    grid-template-columns: 32px;
    grid-template-rows: repeat(3, 32px);
    grid-gap: 7px;
  }
`;

const StyledIcons = styled.div`
  position: absolute;
  top: 8px;

  ${(props) => props.isBadges && badgesPosition}
  ${(props) => props.isQuickButtons && quickButtonsPosition}
  
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundBadgeColor};
    border-radius: 4px;
    box-shadow: 0px 2px 4px ${globalColors.badgeShadow};
  }
`;

StyledIcons.defaultProps = { theme: Base };

class Tile extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      errorLoadSrc: false,
    };

    this.cm = React.createRef();
    this.tile = React.createRef();
    this.checkboxContainerRef = React.createRef();
  }

  onError = () => {
    this.setState({
      errorLoadSrc: true,
    });
  };

  getIconFile = () => {
    const { temporaryIcon, thumbnailClick, thumbnail, item } = this.props;

    const icon = item.isPlugin
      ? item.fileTileIcon
      : thumbnail && !this.state.errorLoadSrc
        ? thumbnail
        : temporaryIcon;

    return (
      <Link type="page" onClick={thumbnailClick}>
        {thumbnail && !this.state.errorLoadSrc ? (
          <img
            src={thumbnail}
            className="thumbnail-image"
            alt="Thumbnail-img"
            onError={this.onError}
          />
        ) : (
          <ReactSVG className="temporary-icon" src={icon} loading={svgLoader} />
        )}
      </Link>
    );
  };

  changeCheckbox = (e) => {
    const { onSelect, item } = this.props;
    onSelect && onSelect(e.target.checked, item);
  };

  onFileIconClick = () => {
    if (!isMobile) return;

    const { onSelect, item } = this.props;
    onSelect && onSelect(true, item);
  };

  onFileClick = (e) => {
    const {
      onSelect,
      item,
      checked,
      setSelection,
      withCtrlSelect,
      withShiftSelect,
    } = this.props;

    if (e.ctrlKey || e.metaKey) {
      withCtrlSelect(item);
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      withShiftSelect(item);
      e.preventDefault();
      return;
    }

    if (
      e.detail === 1 &&
      !e.target.closest(".badges") &&
      !e.target.closest(".item-file-name") &&
      !e.target.closest(".tag")
    ) {
      if (
        e.target.nodeName !== "IMG" &&
        e.target.nodeName !== "INPUT" &&
        e.target.nodeName !== "rect" &&
        e.target.nodeName !== "path" &&
        e.target.nodeName !== "svg" &&
        !this.checkboxContainerRef.current?.contains(e.target)
      ) {
        setSelection && setSelection([]);
      }

      onSelect && onSelect(!checked, item);
    }
  };

  render() {
    const {
      checked,
      children,
      contextButtonSpacerWidth,
      contextOptions,
      element,
      indeterminate,
      tileContextClick,
      dragging,
      isDragging,
      isRecycleBin,
      isArchiveFolder,
      item,
      isActive,
      inProgress,
      isEdit,
      contentElement,
      getContextModel,
      showHotkeyBorder,
      hideContextMenu,
      t,
      columnCount,
      selectTag,
      selectOption,
      isHighlight,
      thumbnails1280x720,
    } = this.props;
    const { isFolder, isRoom, id, fileExst } = item;

    const renderElement = Object.prototype.hasOwnProperty.call(
      this.props,
      "element",
    );

    const renderContentElement = Object.prototype.hasOwnProperty.call(
      this.props,
      "contentElement",
    );

    const renderContext =
      Object.prototype.hasOwnProperty.call(item, "contextOptions") &&
      contextOptions.length > 0;

    const getOptions = () => {
      tileContextClick && tileContextClick();
      return contextOptions;
    };

    const onContextMenu = (e) => {
      tileContextClick && tileContextClick(e.button === 2);
      if (!this.cm.current.menuRef.current) {
        this.tile.current.click(e); //TODO: need fix context menu to global
      }
      this.cm.current.show(e);
    };
    const contextMenuDirection =
      this.props.theme.interfaceDirection === "rtl" ? "left" : "right";
    const icon = this.getIconFile();
    const [FilesTileContent, badges] = children;
    const quickButtons = contentElement;

    const contextMenuHeader = {
      icon: children[0].props.item.icon,
      title: children[0].props.item.title,
      color: children[0].props.item.logo?.color,
      cover: children[0].props.item.logo?.cover,
      logo: children[0].props.item.logo?.medium,
    };

    const title = item.isFolder
      ? t("Translations:TitleShowFolderActions")
      : t("Translations:TitleShowActions");

    const tags = [];

    if (item.providerType) {
      tags.push({
        isThirdParty: true,
        icon: item.thirdPartyIcon,
        label: item.providerKey,
        providerType: item.providerType,
        onClick: () =>
          selectOption({
            option: "typeProvider",
            value: item.providerType,
          }),
      });
    }

    if (item?.tags?.length > 0) {
      tags.push(...item.tags);
    } else {
      tags.push({
        isDefault: true,
        roomType: item.roomType,
        label: getRoomTypeName(item.roomType, t),
        onClick: () =>
          selectOption({
            option: "defaultTypeRoom",
            value: item.roomType,
          }),
      });
    }

    return (
      <StyledTile
        ref={this.tile}
        {...this.props}
        onContextMenu={onContextMenu}
        isDragging={isDragging}
        dragging={dragging && isFolder}
        isFolder={(isFolder && !fileExst) || (!fileExst && id === -1)}
        isRecycleBin={isRecycleBin}
        isArchiveFolder={isArchiveFolder}
        checked={checked}
        isActive={isActive}
        isRoom={isRoom}
        inProgress={inProgress}
        showHotkeyBorder={showHotkeyBorder}
        onClick={this.onFileClick}
        isThirdParty={item.providerType}
        isHighlight={isHighlight}
      >
        {isFolder || (!fileExst && id === -1) ? (
          isRoom ? (
            <>
              <div className="room-tile_top-content">
                {renderElement && !(!fileExst && id === -1) && !isEdit && (
                  <>
                    {!inProgress ? (
                      <div
                        className="file-icon_container"
                        ref={this.checkboxContainerRef}
                      >
                        <StyledElement
                          className="file-icon"
                          isRoom={isRoom}
                          onClick={this.onFileIconClick}
                        >
                          {element}
                        </StyledElement>

                        <Checkbox
                          className="checkbox file-checkbox"
                          isChecked={checked}
                          isIndeterminate={indeterminate}
                          onChange={this.changeCheckbox}
                        />
                      </div>
                    ) : (
                      <Loader
                        className="tile-folder-loader"
                        type="oval"
                        size="16px"
                      />
                    )}
                  </>
                )}
                <StyledContent
                  isFolder={(isFolder && !fileExst) || (!fileExst && id === -1)}
                >
                  {FilesTileContent}
                  {badges}
                </StyledContent>
                <StyledOptionButton spacerWidth={contextButtonSpacerWidth}>
                  {renderContext ? (
                    <ContextMenuButton
                      isFill
                      className="expandButton"
                      directionX="right"
                      getData={getOptions}
                      displayType="toggle"
                      onClick={onContextMenu}
                      title={title}
                    />
                  ) : (
                    <div className="expandButton" />
                  )}
                  <ContextMenu
                    onHide={hideContextMenu}
                    getContextModel={getContextModel}
                    ref={this.cm}
                    header={contextMenuHeader}
                    withBackdrop={true}
                    isRoom={isRoom}
                  />
                </StyledOptionButton>
              </div>
              <div className="room-tile_bottom-content">
                <Tags
                  columnCount={columnCount}
                  onSelectTag={selectTag}
                  tags={tags}
                />
                {/* {item.providerType && (
                    <Tag
                      icon={item.thirdPartyIcon}
                      label={item.providerKey}
                      onClick={() =>
                        selectOption({
                          option: "typeProvider",
                          value: item.providerType,
                        })
                      }
                    />
                  )} */}
                {/* {item.tags.length > 0 ? ( */}

                {/* ) : (
                    <Tag
                      isDefault
                      label={getRoomTypeName(item.roomType, t)}
                      onClick={() =>
                        selectOption({
                          option: "defaultTypeRoom",
                          value: item.roomType,
                        })
                      }
                    />
                  )} */}
              </div>
            </>
          ) : (
            <>
              {renderElement && !(!fileExst && id === -1) && !isEdit && (
                <>
                  {!inProgress ? (
                    <div className="file-icon_container">
                      <StyledElement
                        className="file-icon"
                        isRoom={isRoom}
                        onClick={this.onFileIconClick}
                      >
                        {element}
                      </StyledElement>

                      <Checkbox
                        className="checkbox file-checkbox"
                        isChecked={checked}
                        isIndeterminate={indeterminate}
                        onChange={this.changeCheckbox}
                      />
                    </div>
                  ) : (
                    <Loader
                      className="tile-folder-loader"
                      type="oval"
                      size="16px"
                    />
                  )}
                </>
              )}
              <StyledContent
                isFolder={(isFolder && !fileExst) || (!fileExst && id === -1)}
              >
                {FilesTileContent}
                {badges}
              </StyledContent>
              <StyledOptionButton spacerWidth={contextButtonSpacerWidth}>
                {renderContext ? (
                  <ContextMenuButton
                    isFill
                    className="expandButton"
                    directionX={contextMenuDirection}
                    getData={getOptions}
                    displayType="toggle"
                    onClick={onContextMenu}
                    title={title}
                  />
                ) : (
                  <div className="expandButton" />
                )}
                <ContextMenu
                  onHide={hideContextMenu}
                  getContextModel={getContextModel}
                  ref={this.cm}
                  header={contextMenuHeader}
                  withBackdrop={true}
                />
              </StyledOptionButton>
            </>
          )
        ) : (
          <>
            <StyledFileTileTop
              checked={checked}
              isActive={isActive}
              isMedia={item.canOpenPlayer}
              isHighlight={isHighlight}
              thumbnails1280x720={thumbnails1280x720}
              isImageOrMedia={
                item?.viewAccessibility?.ImageView ||
                item?.viewAccessibility?.MediaView
              }
              isPlugin={item.isPlugin}
            >
              {icon}
            </StyledFileTileTop>

            <StyledIcons isBadges>{badges}</StyledIcons>

            {renderContentElement && (
              <StyledIcons isQuickButtons>{quickButtons}</StyledIcons>
            )}

            <StyledFileTileBottom
              checked={checked}
              isActive={isActive}
              isEdit={isEdit}
              className="file-tile-bottom"
            >
              {id !== -1 && !isEdit && (
                <>
                  {!inProgress ? (
                    <div className="file-icon_container">
                      <div className="file-icon" onClick={this.onFileIconClick}>
                        {element}
                      </div>
                      <Checkbox
                        className="file-checkbox"
                        isChecked={checked}
                        isIndeterminate={indeterminate}
                        onChange={this.changeCheckbox}
                      />
                    </div>
                  ) : (
                    <Loader
                      className="tile-file-loader"
                      type="oval"
                      size="16px"
                    />
                  )}
                </>
              )}
              <StyledContent
                isFolder={(isFolder && !fileExst) || (!fileExst && id === -1)}
              >
                {FilesTileContent}
              </StyledContent>
              <StyledOptionButton spacerWidth={contextButtonSpacerWidth}>
                {renderContext ? (
                  <ContextMenuButton
                    isFill
                    className="expandButton"
                    directionX="left"
                    getData={getOptions}
                    displayType="toggle"
                    onClick={onContextMenu}
                    title={title}
                  />
                ) : (
                  <div className="expandButton" />
                )}
                <ContextMenu
                  getContextModel={getContextModel}
                  ref={this.cm}
                  header={contextMenuHeader}
                  withBackdrop={isMobileUtils()}
                  onHide={hideContextMenu}
                />
              </StyledOptionButton>
            </StyledFileTileBottom>
          </>
        )}
      </StyledTile>
    );
  }
}

Tile.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
  className: PropTypes.string,
  contextButtonSpacerWidth: PropTypes.string,
  contextOptions: PropTypes.array,
  data: PropTypes.object,
  element: PropTypes.element,
  id: PropTypes.string,
  indeterminate: PropTypes.bool,
  needForUpdate: PropTypes.func,
  onSelect: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  viewAs: PropTypes.string,
  tileContextClick: PropTypes.func,
  contentElement: PropTypes.element,
};

Tile.defaultProps = {
  contextButtonSpacerWidth: "32px",
  item: {},
};

export default withTheme(Tile);
