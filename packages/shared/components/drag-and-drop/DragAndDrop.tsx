/* eslint-disable @typescript-eslint/no-use-before-define */
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

export { DragAndDrop };
