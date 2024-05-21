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

/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react";
import { useDropzone } from "react-dropzone";
import getFilesFromEvent from "./get-files-from-event";

import StyledDragAndDrop from "./DragAndDrop.styled";
import { DragAndDropProps } from "./DragAndDrop.types";

const DragAndDrop = (props: DragAndDropProps) => {
  const {
    isDropZone,
    children,
    dragging,
    className,

    ...rest
  } = props;

  const { onDrop, onDragOver, onDragLeave } = props;

  const classNameProp = className || "";

  const onDropAction = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) onDrop?.(acceptedFiles);
  };

  const onDragOverAction = (e: React.DragEvent<HTMLElement>) => {
    onDragOver?.(isDragActive, e);
  };

  const onDragLeaveAction = (e: React.DragEvent<HTMLElement>) => {
    onDragLeave?.(e);
  };

  const { getRootProps, isDragActive } = useDropzone({
    noDragEventsBubbling: !isDropZone,
    onDrop: onDropAction,
    onDragOver: onDragOverAction,
    onDragLeave: onDragLeaveAction,
    getFilesFromEvent: (event) => getFilesFromEvent(event),
  });

  return (
    <StyledDragAndDrop
      {...rest}
      className={`drag-and-drop ${classNameProp}`}
      dragging={dragging}
      isDragAccept={isDragActive}
      drag={isDragActive && isDropZone && onDrop}
      {...getRootProps()}
    >
      {children}
    </StyledDragAndDrop>
  );
};

export default DragAndDrop;
