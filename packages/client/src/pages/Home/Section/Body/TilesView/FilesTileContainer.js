// (c) Copyright Ascensio System SIA 2010-2024
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
} from "react";
import { inject, observer } from "mobx-react";
import elementResizeDetectorMaker from "element-resize-detector";
import TileContainer from "./sub-components/TileContainer";
import FileTile from "./FileTile";

const getThumbSize = (width) => {
  let imgWidth = 216;

  if (width >= 240 && width < 264) {
    imgWidth = 240;
  } else if (width >= 264 && width < 288) {
    imgWidth = 264;
  } else if (width >= 288 && width < 312) {
    imgWidth = 288;
  } else if (width >= 312 && width < 336) {
    imgWidth = 312;
  } else if (width >= 336 && width < 360) {
    imgWidth = 336;
  } else if (width >= 360 && width < 400) {
    imgWidth = 360;
  } else if (width >= 400 && width < 440) {
    imgWidth = 400;
  } else if (width >= 440) {
    imgWidth = 440;
  }

  return `${imgWidth}x156`;
};

const elementResizeDetector = elementResizeDetectorMaker({
  strategy: "scroll",
  callOnAdd: false,
});

const FilesTileContainer = ({
  filesList,
  t,
  sectionWidth,
  withPaging,
  thumbnails1280x720,
}) => {
  const tileRef = useRef(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const [thumbSize, setThumbSize] = useState("");
  const [columnCount, setColumnCount] = useState(null);

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

      const size = thumbnails1280x720 ? "1280x720" : getThumbSize(width);

      const widthWithoutPadding = width - 32;

      const columns = Math.floor(widthWithoutPadding / 80);

      if (columns != columnCount) setColumnCount(columns);

      // console.log(
      //   `Body width: ${document.body.clientWidth} Tile width: ${width} ThumbSize: ${size}`
      // );

      if (size === thumbSize) return;

      setThumbSize(size);
    },
    [columnCount, thumbSize, thumbnails1280x720]
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
          sectionWidth={sectionWidth}
          selectableRef={onSetTileRef}
          thumbSize={thumbSize}
          columnCount={columnCount}
          withRef={true}
        />
      ) : (
        <FileTile
          id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
          key={
            item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
          }
          item={item}
          itemIndex={index}
          sectionWidth={sectionWidth}
          thumbSize={thumbSize}
          columnCount={columnCount}
        />
      );
    });
  }, [filesList, sectionWidth, onSetTileRef, thumbSize, columnCount]);

  return (
    <TileContainer
      className="tile-container"
      draggable
      useReactWindow={!withPaging}
      headingFolders={t("Translations:Folders")}
      headingFiles={t("Translations:Files")}
    >
      {filesListNode}
    </TileContainer>
  );
};

export default inject(({ settingsStore, filesStore, filesSettingsStore }) => {
  const { filesList } = filesStore;
  const { withPaging } = settingsStore;
  const { thumbnails1280x720 } = filesSettingsStore;

  return {
    filesList,
    withPaging,
    thumbnails1280x720,
  };
})(observer(FilesTileContainer));
