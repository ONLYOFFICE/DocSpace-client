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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { Heading } from "@docspace/shared/components/heading";
import { tablet, desktop } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";
import InfiniteGrid from "./InfiniteGrid";

const paddingCss = css`
  @media ${desktop} {
    margin-inline-start: 1px;
    padding-inline-end: 0;
  }

  @media ${tablet} {
    margin-inline-start: -1px;
  }
`;

const StyledGridWrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.isRooms
      ? "repeat(auto-fill, minmax(274px, 1fr))"
      : "repeat(auto-fill, minmax(216px, 1fr))"};
  width: 100%;
  margin-bottom: ${(props) => (props.isFolders || props.isRooms ? "23px" : 0)};
  box-sizing: border-box;
  ${paddingCss};

  grid-gap: 14px 16px;

  @media ${tablet} {
    grid-gap: 14px;
  }

  .tiles-loader {
    padding-top: 14px;

    &:nth-of-type(n + 3) {
      display: block;
    }
  }
`;

const StyledTileContainer = styled.div`
  position: relative;
  height: 100%;
  user-select: none;

  .tile-item-wrapper {
    position: relative;
    width: 100%;

    &.file {
      padding: 0;
    }
    &.folder {
      padding: 0;
    }
  }

  .tile-items-heading {
    margin: 0;
    margin-bottom: 15px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    width: fit-content;

    div {
      cursor: pointer !important;

      .sort-combo-box {
        margin-inline-end: 3px;
        .dropdown-container {
          top: 104%;
          bottom: auto;
          min-width: 200px;
          margin-top: 3px;

          .option-item {
            display: flex;
            align-items: center;
            justify-content: space-between;

            min-width: 200px;

            svg {
              width: 16px;
              height: 16px;
            }

            .option-item__icon {
              display: none;
              cursor: pointer;
              ${(props) =>
                !props.isDesc &&
                css`
                  transform: rotate(180deg);
                `}

              path {
                fill: ${(props) => props.theme.filterInput.sort.sortFill};
              }
            }

            :hover {
              .option-item__icon {
                display: flex;
              }
            }
          }

          .selected-option-item {
            background: ${(props) =>
              props.theme.filterInput.sort.hoverBackground};
            cursor: auto;

            .selected-option-item__icon {
              display: flex;
            }
          }
        }

        .optionalBlock {
          display: flex;
          flex-direction: row;
          align-items: center;

          font-size: 12px;
          font-weight: 600;

          color: ${(props) => props.theme.filterInput.sort.tileSortColor};

          .sort-icon {
            margin-inline-end: 8px;
            svg {
              path {
                fill: ${(props) => props.theme.filterInput.sort.tileSortFill};
              }
            }
          }
        }

        .combo-buttons_arrow-icon {
          display: none;
        }
      }
    }
  }

  @media ${tablet} {  
      margin-top: 16px;
    margin-inline-end: -3px;
  }
`;

StyledTileContainer.defaultProps = { theme: Base };

class TileContainer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      children,
      useReactWindow,
      id,
      className,
      style,
      headingFolders,
      headingFiles,
      isDesc,
    } = this.props;

    const Rooms = [];
    const Folders = [];
    const Files = [];

    React.Children.map(children, (item) => {
      const { isFolder, isRoom, fileExst, id } = item.props.item;
      if ((isFolder || id === -1) && !fileExst && !isRoom) {
        Folders.push(
          <div className="tile-item-wrapper folder" key={id}>
            {item}
          </div>,
        );
      } else if (isRoom) {
        Rooms.push(
          <div className="tile-item-wrapper room" key={id}>
            {item}
          </div>,
        );
      } else {
        Files.push(
          <div className="tile-item-wrapper file" key={id}>
            {item}
          </div>,
        );
      }
    });

    const renderTile = (
      <>
        {Rooms.length > 0 ? (
          useReactWindow ? (
            Rooms
          ) : (
            <StyledGridWrapper isRooms>{Rooms}</StyledGridWrapper>
          )
        ) : null}

        {Folders.length > 0 && (
          <Heading
            size="xsmall"
            id={"folder-tile-heading"}
            className="tile-items-heading"
          >
            {headingFolders}
          </Heading>
        )}
        {Folders.length > 0 ? (
          useReactWindow ? (
            Folders
          ) : (
            <StyledGridWrapper isFolders>{Folders}</StyledGridWrapper>
          )
        ) : null}

        {Files.length > 0 && (
          <Heading size="xsmall" className="tile-items-heading">
            {headingFiles}
          </Heading>
        )}
        {Files.length > 0 ? (
          useReactWindow ? (
            Files
          ) : (
            <StyledGridWrapper>{Files}</StyledGridWrapper>
          )
        ) : null}
      </>
    );

    return (
      <StyledTileContainer
        id={id}
        className={`${className} files-tile-container`}
        style={style}
        useReactWindow={useReactWindow}
        isDesc={isDesc}
      >
        {useReactWindow ? (
          <InfiniteGrid>{renderTile}</InfiniteGrid>
        ) : (
          renderTile
        )}
      </StyledTileContainer>
    );
  }
}

TileContainer.propTypes = {
  children: PropTypes.any.isRequired,
  useReactWindow: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

TileContainer.defaultProps = {
  id: "tileContainer",
};

export default inject(({ settingsStore, filesStore, treeFoldersStore }) => {
  const { filter } = filesStore;
  const { isFavoritesFolder, isRecentFolder } = treeFoldersStore;

  const isDesc = filter?.sortOrder === "desc";

  return {
    isFavoritesFolder,
    isRecentFolder,
    isDesc,
  };
})(
  observer(
    withTranslation(["Files", "Common", "Notifications"])(TileContainer),
  ),
);
