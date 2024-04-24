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
import { tablet } from "@docspace/shared/utils";
import { isMobile } from "react-device-detect";
import { withTheme } from "styled-components";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Loader } from "@docspace/shared/components/loader";
import { Base } from "@docspace/shared/themes";
import { ROOMS_TYPE_TRANSLATIONS } from "@docspace/shared/constants";

const svgLoader = () => <div style={{ width: "96px" }} />;

const StyledTemplatesTile = styled.div`
  display: contents;

  .room-tile-template_top-content {
    width: 100%;
    height: 66px;

    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    justify-content: flex-start;
    align-items: center;
    align-content: center;

    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundColor};

    border-radius: ${({ theme, isRooms }) =>
      isRooms
        ? theme.filesSection.tilesView.tile.roomsUpperBorderRadius
        : theme.filesSection.tilesView.tile.upperBorderRadius};
  }

  .room-tile-template_bottom-content {
    display: ${(props) => props.isThirdParty && "flex"};
    width: 100%;
    height: 60px;
    align-content: center;

    box-sizing: border-box;
    overflow: hidden;

    padding: 0px 16px 8px;
    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundColor};
    border-radius: ${({ theme, isRooms }) =>
      isRooms
        ? theme.filesSection.tilesView.tile.roomsBottomBorderRadius
        : theme.filesSection.tilesView.tile.bottomBorderRadius};

    .room-tile_bottom-content-wrapper {
      display: grid;
      grid-template-columns: 1fr 2fr;
      /* gap: 14px; */

      .room-tile_bottom-content_field {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        gap: 8px;
      }
    }
  }
`;

const StyledContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-basis: 100%;
  overflow: hidden;

  .tile-content,
  .row-main-container-wrapper {
    overflow: hidden;
  }

  a {
    display: block !important;
  }

  .new-items {
    margin-left: 12px;
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
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: ${(props) => (props.isRoom ? "8px" : "4px")};
        `
      : css`
          margin-right: ${(props) => (props.isRoom ? "8px" : "4px")};
        `}
  user-select: none;
  margin-top: 3px;

  height: 32px;
  width: 32px;
`;

const StyledOptionButton = styled.div`
  display: block;

  .expandButton > div:first-child {
    padding: 8px 15px;
  }
`;

StyledOptionButton.defaultProps = { theme: Base };

const badgesPosition = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: 9px;
        `
      : css`
          left: 9px;
        `}

  .badges {
    display: grid;
    grid-template-columns: repeat(3, fit-content(60px));
    grid-template-rows: 32px;
    grid-gap: 7px;

    .badge-new-version {
      order: 1;
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
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          left: 9px;
        `
      : css`
          right: 9px;
        `}

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
    box-shadow: 0px 2px 4px rgba(4, 15, 27, 0.16);
  }
`;

StyledIcons.defaultProps = { theme: Base };

class TemplatesTile extends React.PureComponent {
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
      item,
      inProgress,
      isEdit,
      getContextModel,
      hideContextMenu,
      t,
      selectOption,
      additionalInfo,
      theme,
    } = this.props;
    const { isFolder, isRoom, id, fileExst, createdBy } = item;

    const renderElement = Object.prototype.hasOwnProperty.call(
      this.props,
      "element",
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
    const [FilesTileContent, badges] = children;

    const contextMenuHeader = {
      icon: children[0].props.item.icon,
      title: children[0].props.item.title,
      color: children[0].props.item.logo?.color,
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
        label: t(ROOMS_TYPE_TRANSLATIONS[item.roomType]),
        onClick: () =>
          selectOption({
            option: "defaultTypeRoom",
            value: item.roomType,
          }),
      });
    }

    return (
      <StyledTemplatesTile>
        <div className="room-tile-template_top-content">
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
        <div className="room-tile-template_bottom-content">
          <div className="room-tile_bottom-content-wrapper">
            <div className="room-tile_bottom-content_field">
              <Text
                truncate
                fontSize="13px"
                fontWeight={400}
                color={theme.filesSection.tilesView.subTextColor}
              >
                {t("Common:Owner")}
              </Text>
              <Text
                truncate
                fontSize="13px"
                fontWeight={400}
                color={theme.filesSection.tilesView.subTextColor}
              >
                {t("Common:Content")}
              </Text>
            </div>
            <div className="room-tile_bottom-content_field">
              <Text
                truncate
                fontSize="13px"
                fontWeight={600}
                color={theme.filesSection.tilesView.subTextColor}
              >
                {createdBy.displayName}
              </Text>
              <Text
                truncate
                fontSize="13px"
                fontWeight={600}
                color={theme.filesSection.tilesView.subTextColor}
              >
                {additionalInfo}
              </Text>
            </div>
          </div>
        </div>
      </StyledTemplatesTile>
    );
  }
}

TemplatesTile.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
  className: PropTypes.string,
  contextButtonSpacerWidth: PropTypes.string,
  contextOptions: PropTypes.array,
  element: PropTypes.element,
  id: PropTypes.string,
  indeterminate: PropTypes.bool,
  onSelect: PropTypes.func,
  tileContextClick: PropTypes.func,
};

TemplatesTile.defaultProps = {
  contextButtonSpacerWidth: "32px",
  item: {},
};

export default withTheme(TemplatesTile);
