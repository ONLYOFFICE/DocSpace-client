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

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
  useContext,
} from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Context } from "@docspace/shared/utils";

import FileTile from "./FileTile";
import { FileTileProvider } from "./FileTile.provider";
import { elementResizeDetector } from "./FileTile.utils";

import TileContainer from "./sub-components/TileContainer";

const FilesTileContainer = ({ filesList }) => {
  const tileRef = useRef(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const [thumbSize, setThumbSize] = useState("");
  const [columnCount, setColumnCount] = useState(null);

  const { sectionWidth } = useContext(Context);

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
      if (!node || !isMountedRef.current) return;

      const { width } = node.getBoundingClientRect();

      if (width === 0) return;

      const size = "1280x720";

      const widthWithoutPadding = width - 32;

      const columns = Math.floor(widthWithoutPadding / 80);

      if (columns != columnCount) setColumnCount(columns);

      // console.log(
      //   `Body width: ${document.body.clientWidth} Tile width: ${width} ThumbSize: ${size}`
      // );

      if (size === thumbSize) return;

      setThumbSize(size);
    },
    [columnCount, thumbSize],
  );

  const onSetTileRef = React.useCallback((node) => {
    if (node) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onResize(node);

        if (tileRef?.current) elementResizeDetector.uninstall(tileRef.current);

        tileRef.current = node;

        elementResizeDetector.listenTo(node, onResize);
      }, 100);
    }
  }, []);

  const filesListNode = useMemo(() => {
    return filesList.map((item, index) => {
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
        />
      ) : (
        <FileTile
          id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
          key={
            item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
          }
          item={item}
          itemIndex={index}
        />
      );
    });
  }, [filesList, onSetTileRef, sectionWidth]);

  return (
    <FileTileProvider columnCount={columnCount} thumbSize={thumbSize}>
      <TileContainer
        className="tile-container"
        draggable
        useReactWindow
        headingFolders={t("Translations:Folders")}
        headingFiles={t("Translations:Files")}
      >
        {filesListNode}
      </TileContainer>
    </FileTileProvider>
  );
};

export default inject(({ filesStore }) => {
  const { filesList } = filesStore;

  return {
    filesList,
  };
})(observer(FilesTileContainer));
