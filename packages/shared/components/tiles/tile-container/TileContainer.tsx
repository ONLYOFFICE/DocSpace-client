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

import React from "react";
import classNames from "classnames";
import { TileContainerProps, TileItemProps } from "./TileContainer.types";
import { Heading, HeadingSize } from "../../heading";

import styles from "./TileContainer.module.scss";

export const TileContainer = ({
  children,
  useReactWindow,
  id = "tileContainer",
  className,
  infiniteGrid: InfiniteGrid,
  headingFolders,
  headingFiles,
  isDesc,
  style,
  noSelect,
}: TileContainerProps) => {
  const Rooms: React.ReactElement[] = [];
  const Folders: React.ReactElement[] = [];
  const Files: React.ReactElement[] = [];
  const Templates: React.ReactElement[] = [];

  React.Children.map(children, (item) => {
    if (
      !item ||
      !React.isValidElement<TileItemProps>(item) ||
      !item.props?.item
    )
      return null;

    const {
      isFolder,
      isRoom,
      isTemplate,
      fileExst,
      id: itemId,
    } = item.props.item;

    if ((isFolder || itemId === -1) && !fileExst && !isRoom) {
      Folders.push(
        <div
          className={classNames(
            styles.tileItemWrapper,
            styles.folder,
            "folder",
          )}
          key={itemId}
        >
          {item}
        </div>,
      );
    } else if (isTemplate) {
      Templates.push(
        <div
          className={classNames(
            styles.tileItemWrapper,
            styles.template,
            "template",
          )}
          key={itemId}
        >
          {item}
        </div>,
      );
    } else if (isRoom) {
      Rooms.push(
        <div
          className={classNames(styles.tileItemWrapper, styles.room, "room")}
          key={itemId}
        >
          {item}
        </div>,
      );
    } else {
      Files.push(
        <div
          className={classNames(styles.tileItemWrapper, styles.file, "file")}
          key={itemId}
        >
          {item}
        </div>,
      );
    }
  });

  const headingClassNames = classNames(styles.header, {
    [styles.isDesc]: isDesc,
  });

  const renderTile = (
    <>
      {Rooms.length > 0 ? (
        useReactWindow ? (
          Rooms
        ) : (
          <div className={classNames(styles.gridWrapper, styles.rooms)}>
            {Rooms}
          </div>
        )
      ) : null}

      {Templates.length > 0 ? (
        useReactWindow ? (
          Templates
        ) : (
          <div className={classNames(styles.gridWrapper, styles.templates)}>
            {Templates}
          </div>
        )
      ) : null}

      {Folders.length > 0 ? (
        <Heading
          size={HeadingSize.xsmall}
          id="folder-tile-heading"
          className={headingClassNames}
          data-type="header"
        >
          {headingFolders}
        </Heading>
      ) : null}
      {Folders.length > 0 ? (
        useReactWindow ? (
          Folders
        ) : (
          <div className={classNames(styles.gridWrapper, styles.folders)}>
            {Folders}
          </div>
        )
      ) : null}

      {Files.length > 0 ? (
        <Heading
          size={HeadingSize.xsmall}
          className={headingClassNames}
          data-type="header"
        >
          {headingFiles}
        </Heading>
      ) : null}
      {Files.length > 0 ? (
        useReactWindow ? (
          Files
        ) : (
          <div className={classNames(styles.gridWrapper, styles.files)}>
            {Files}
          </div>
        )
      ) : null}
    </>
  );

  const isRooms = Rooms.length > 0;
  const isTemplates = Templates.length > 0;

  return (
    <div
      className={classNames(className, styles.tileContainer, {
        [styles.noSelect]: noSelect,
      })}
      id={id}
      style={style}
    >
      {useReactWindow && InfiniteGrid ? (
        <InfiniteGrid isRooms={isRooms} isTemplates={isTemplates}>
          {renderTile}
        </InfiniteGrid>
      ) : (
        renderTile
      )}
    </div>
  );
};
