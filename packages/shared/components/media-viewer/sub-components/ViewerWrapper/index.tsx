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

import equal from "fast-deep-equal/react";
import React, { useMemo, memo, useCallback } from "react";

import classNames from "classnames";
import { isSeparator } from "../../../../utils/typeGuards";

import { Viewer } from "../Viewer";
import { getCustomToolbar, getPDFToolbar } from "../../MediaViewer.helpers";
import styles from "./ViewerWrapper.module.scss";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { DropDownItem } from "../../../drop-down-item";
import type ViewerWrapperProps from "./ViewerWrapper.props";

const ViewerWrapper = memo(
  (props: ViewerWrapperProps) => {
    const {
      isPdf,
      title,
      isAudio,
      isVideo,
      visible,
      fileUrl,
      isImage,
      playlist,
      audioIcon,
      targetFile,
      userAccess,
      errorTitle,
      headerIcon,
      playlistPos,
      isPreviewFile,
      currentDeviceType,
      isPublicFile,
      autoPlay,

      onClose,
      onNextClick,
      onPrevClick,
      contextModel,
      onDeleteClick,
      onDownloadClick,
      onSetSelectionFile,
      pluginViewerContent,
    } = props;

    // const { interfaceDirection } = useTheme();
    // const isRtl = interfaceDirection === "rtl";

    const onClickContextItem = useCallback(
      (
        item: ContextMenuModel,
        event:
          | React.MouseEvent<Element, MouseEvent>
          | React.ChangeEvent<HTMLInputElement>,
      ) => {
        if (isSeparator(item)) return;

        onSetSelectionFile();
        item.onClick?.(event);
      },
      [onSetSelectionFile],
    );

    const generateContextMenu = (
      isOpen: boolean,
      right?: string,
      bottom?: string,
    ) => {
      const model = contextModel();

      if (model.filter((m) => !m.disabled).length === 0) return null;

      return (
        <DropDown
          className={styles.dropDown}
          open={isOpen}
          directionY="top"
          withBackdrop={false}
          isDefaultMode={false}
          directionX="right"
          manualY={`${bottom ?? 63}px`}
          manualX={`${right ?? -31}px`}
        >
          {model.map((item) => {
            if (item.disabled) return;
            const isItemSeparator = isSeparator(item);

            return (
              <DropDownItem
                className={classNames(
                  styles.dropDownItem,
                  `${item.isSeparator ? "is-separator" : ""}`,
                )}
                key={item.key}
                label={isItemSeparator ? undefined : item.label}
                icon={!isItemSeparator && item.icon ? item.icon : ""}
                onClick={(event) => onClickContextItem(item, event)}
              />
            );
          })}
        </DropDown>
      );
    };

    const toolbar = useMemo(() => {
      const file = targetFile;
      const isEmptyContextMenu =
        contextModel().filter((item) => !item.disabled).length === 0;

      const customToolbar = isPdf
        ? getPDFToolbar()
        : file
          ? getCustomToolbar(
              file,
              isEmptyContextMenu,
              onDeleteClick,
              onDownloadClick,
            )
          : [];

      const currentItem = playlist?.[playlistPos];
      const canShare = currentItem?.canShare ?? false;

      const toolbars =
        !canShare && userAccess
          ? customToolbar.filter(
              (x) => x.key !== "share" && x.key !== "share-separator",
            )
          : customToolbar.filter((x) => x.key !== "delete");

      return toolbars;
    }, [
      isPdf,
      playlist,
      userAccess,
      targetFile,
      playlistPos,
      contextModel,
      onDeleteClick,
      onDownloadClick,
    ]);

    return (
      <Viewer
        title={title}
        isPdf={isPdf}
        fileUrl={fileUrl}
        isAudio={isAudio}
        isVideo={isVideo}
        visible={visible}
        isImage={isImage}
        toolbar={toolbar}
        autoPlay={autoPlay}
        playlist={playlist}
        audioIcon={audioIcon}
        errorTitle={errorTitle}
        headerIcon={headerIcon}
        targetFile={targetFile}
        playlistPos={playlistPos}
        isPreviewFile={isPreviewFile}
        currentDeviceType={currentDeviceType}
        isPublicFile={isPublicFile}
        onMaskClick={onClose}
        onNextClick={onNextClick}
        onPrevClick={onPrevClick}
        contextModel={contextModel}
        onDownloadClick={onDownloadClick}
        onSetSelectionFile={onSetSelectionFile}
        generateContextMenu={generateContextMenu}
        pluginViewerContent={pluginViewerContent}
      />
    );
  },
  (prevProps, nextProps) => equal(prevProps, nextProps),
);

ViewerWrapper.displayName = "ViewerWrapper";

export { ViewerWrapper };

