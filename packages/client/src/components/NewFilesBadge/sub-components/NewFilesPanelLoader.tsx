/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from "react";
import classNames from "classnames";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "../new-files-panel.module.scss";

type NewFilesPanelLoaderProps = {
  isRooms: boolean;
};

export const NewFilesPanelLoader = ({ isRooms }: NewFilesPanelLoaderProps) => {
  if (isRooms)
    return (
      <>
        <div
          className={classNames(styles.item, {
            [styles.isRooms]: isRooms,
            [styles.isFirst]: true,
            [styles.isLoader]: true,
          })}
        >
          <RectangleSkeleton className="date-item" width="80px" height="16px" />
          <div className="room-items-container">
            <div className={styles.roomItem}>
              <RectangleSkeleton width="120px" height="24px" />
            </div>
            <div className="file-items-container">
              <div
                className={classNames(styles.fileItem, {
                  [styles.isRooms]: isRooms,
                })}
              >
                <RectangleSkeleton width="100%" height="32px" />
              </div>
              <div
                className={classNames(styles.fileItem, {
                  [styles.isRooms]: isRooms,
                })}
              >
                <RectangleSkeleton width="100%" height="32px" />
              </div>
              <div
                className={classNames(styles.fileItem, {
                  [styles.isRooms]: isRooms,
                })}
              >
                <RectangleSkeleton width="100%" height="32px" />
              </div>
              <RectangleSkeleton
                className="more-items"
                width="120px"
                height="24px"
              />
            </div>
          </div>
        </div>
        <div
          className={classNames(styles.item, {
            [styles.isRooms]: isRooms,
            [styles.isFirst]: false,
            [styles.isLoader]: true,
          })}
        >
          <RectangleSkeleton className="date-item" width="80px" height="16px" />
          <div className="room-items-container">
            <div className={styles.roomItem}>
              <RectangleSkeleton width="120px" height="24px" />
            </div>
            <div className="file-items-container">
              <div
                className={classNames(styles.fileItem, {
                  [styles.isRooms]: isRooms,
                })}
              >
                <RectangleSkeleton width="100%" height="32px" />
              </div>
              <div
                className={classNames(styles.fileItem, {
                  [styles.isRooms]: isRooms,
                })}
              >
                <RectangleSkeleton width="100%" height="32px" />
              </div>
              <div
                className={classNames(styles.fileItem, {
                  [styles.isRooms]: isRooms,
                })}
              >
                <RectangleSkeleton width="100%" height="32px" />
              </div>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <div
      className={classNames(styles.item, {
        [styles.isRooms]: false,
        [styles.isFirst]: true,
        [styles.isLoader]: true,
      })}
    >
      <RectangleSkeleton className="date-item" width="80px" height="16px" />

      <div className="file-items-container">
        <div
          className={classNames(styles.fileItem, { [styles.isRooms]: false })}
        >
          <RectangleSkeleton width="100%" height="32px" />
        </div>
        <div
          className={classNames(styles.fileItem, { [styles.isRooms]: false })}
        >
          <RectangleSkeleton width="100%" height="32px" />
        </div>
        <div
          className={classNames(styles.fileItem, { [styles.isRooms]: false })}
        >
          <RectangleSkeleton width="100%" height="32px" />
        </div>
        <RectangleSkeleton className="more-items" width="120px" height="24px" />
      </div>
    </div>
  );
};
