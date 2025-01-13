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
import styled, { css, withTheme } from "styled-components";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { tablet } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Loader } from "@docspace/shared/components/loader";
import { Base } from "@docspace/shared/themes";

const checkedStyle = css`
  background: ${({ theme }) =>
    theme.filesSection.tilesView.tile.roomsCheckedColor};
`;

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

    border-radius: ${({ theme }) =>
      theme.filesSection.tilesView.tile.roomsUpperBorderRadius};
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
    border-radius: ${({ theme }) =>
      theme.filesSection.tilesView.tile.roomsBottomBorderRadius};

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

  ${(props) =>
    !props.isEdit &&
    (props.checked || props.isActive) &&
    css`
      .room-tile-template_top-content,
      .room-tile-template_bottom-content {
        ${checkedStyle}
      }
    `}

  :hover {
    .room-tile-template_top-content,
    .room-tile-template_bottom-content {
      ${checkedStyle}
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
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
          margin-left: ${props.isRoom ? "8px" : "4px"};
        `
      : css`
          margin-right: ${props.isRoom ? "8px" : "4px"};
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

const TemplatesTile = (props) => {
  const {
    checked,
    contextButtonSpacerWidth,
    element,
    indeterminate,
    item,
    inProgress,
    isEdit,
    getContextModel,
    hideContextMenu,
    t,
    additionalInfo,
    theme,
    onContextMenu,
    cmRef,
    cbRef,
    changeCheckbox,
    onFileIconClick,
    renderElement,
    renderContext,
    getOptions,
    contextMenuHeader,
    FilesTileContent,
    badges,
    contextMenuTitle,
    isActive,
  } = props;
  const { isFolder, isRoom, id, fileExst, createdBy } = item;

  return (
    <StyledTemplatesTile checked={checked} isActive={isActive} isEdit={isEdit}>
      <div className="room-tile-template_top-content">
        {renderElement &&
          !(!fileExst && id === -1) &&
          !isEdit &&
          (!inProgress ? (
            <div className="file-icon_container" ref={cbRef}>
              <StyledElement
                className="file-icon"
                isRoom={isRoom}
                onClick={onFileIconClick}
              >
                {element}
              </StyledElement>

              <Checkbox
                className="checkbox file-checkbox"
                isChecked={checked}
                isIndeterminate={indeterminate}
                onChange={changeCheckbox}
              />
            </div>
          ) : (
            <Loader className="tile-folder-loader" type="oval" size="16px" />
          ))}
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
              title={contextMenuTitle}
            />
          ) : (
            <div className="expandButton" />
          )}
          <ContextMenu
            onHide={hideContextMenu}
            getContextModel={getContextModel}
            ref={cmRef}
            header={contextMenuHeader}
            withBackdrop
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
};

export default withTheme(TemplatesTile);
