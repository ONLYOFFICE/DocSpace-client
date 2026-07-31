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

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
  use,
} from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Context } from "@docspace/ui-kit/utils/context";
import { TileContainer } from "@docspace/ui-kit/components/tiles/tile-container";

import FileTile from "./FileTile";
import { FileTileProvider } from "./FileTile.provider";
import { elementResizeDetector } from "./FileTile.utils";

import InfiniteGrid from "./sub-components/InfiniteGrid";
import withContainer from "../../../../../HOCs/withContainer";

const FilesTileContainer = ({
  list,
  isTutorialEnabled,
  isDesc,
  selectedFolderTitle,
  setDropTargetPreview,
  disableDrag,
  canCreateSecurity,
  withContentSelection,
}) => {
  const tileRef = useRef(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const [thumbSize, setThumbSize] = useState(null);
  const [columnCount, setColumnCount] = useState(null);

  const { sectionWidth } = use(Context);

  const { t } = useTranslation(["Translations"]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (!tileRef?.current) return;
      clearTimeout(timerRef.current);
      elementResizeDetector.uninstall(tileRef.current);
    };
  }, []);

  const onResize = useCallback(
    (node) => {
      if (!node?.getBoundingClientRect || !isMountedRef.current) return;

      try {
        const { width } = node.getBoundingClientRect();

        if (width === 0) return;

        const size = "1280x720";
        const widthWithoutPadding = width - 32;
        const columns = Math.floor(widthWithoutPadding / 80);

        if (columns !== columnCount) setColumnCount(columns);
        if (size !== thumbSize) setThumbSize(size);
      } catch (err) {
        console.error("Error measuring tile container:", err);
      }
    },
    [columnCount, thumbSize],
  );

  const onSetTileRef = useCallback(
    (node) => {
      if (!node) return;

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (tileRef.current) {
          elementResizeDetector.uninstall(tileRef.current);
        }

        tileRef.current = node;
        onResize(node);
        elementResizeDetector.listenTo(node, onResize);
      }, 100);
    },
    [onResize],
  );

  const filesListNode = useMemo(() => {
    return list.map((item, index) => {
      return index % 11 == 0 ? (
        <FileTile
          id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
          key={
            item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
          }
          item={item}
          itemIndex={index}
          selectableRef={onSetTileRef}
          withRef
          dataTestId={`tile_${index}`}
          selectedFolderTitle={selectedFolderTitle}
          setDropTargetPreview={setDropTargetPreview}
          disableDrag={disableDrag}
          canCreateSecurity={canCreateSecurity}
          documentTitle={item.title}
        />
      ) : (
        <FileTile
          id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
          key={
            item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
          }
          item={item}
          itemIndex={index}
          dataTestId={`tile_${index}`}
          selectedFolderTitle={selectedFolderTitle}
          setDropTargetPreview={setDropTargetPreview}
          disableDrag={disableDrag}
          canCreateSecurity={canCreateSecurity}
          documentTitle={item.title}
        />
      );
    });
  }, [list, onSetTileRef, sectionWidth, isTutorialEnabled]);

  return (
    <FileTileProvider columnCount={columnCount} thumbSize={thumbSize}>
      <TileContainer
        isDesc={isDesc}
        className="tile-container"
        useReactWindow
        infiniteGrid={InfiniteGrid}
        headingFolders={t("Common:Folders")}
        headingFiles={t("Common:Files")}
        noSelect={!withContentSelection}
      >
        {filesListNode}
      </TileContainer>
    </FileTileProvider>
  );
};

export default inject(
  ({ filesStore, uploadDataStore, selectedFolderStore, hotkeyStore }) => {
    const { filesList, disableDrag } = filesStore;
    const { filter } = filesStore;
    const { withContentSelection } = hotkeyStore;

    const isDesc = filter?.sortOrder === "desc";

    const { primaryProgressDataStore } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;
    const { title: selectedFolderTitle, security: canCreateSecurity } =
      selectedFolderStore;

    return {
      filesList,
      isDesc,
      withContentSelection,
      setDropTargetPreview,
      selectedFolderTitle,
      disableDrag,
      canCreateSecurity,
    };
  },
)(withContainer(observer(FilesTileContainer)));
