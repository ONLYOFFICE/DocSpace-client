export interface DragAndDropProps {
  /** Children elements */
  children: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Sets the component as a dropzone */
  isDropZone?: boolean;
  /** Shows that the item is being dragged now. */
  dragging?: boolean;
  /** Occurs when the mouse button is pressed */
  onMouseDown?: () => void;
  /** Occurs when the dragged element is dropped on the drop target */
  onDrop?: (acceptedFiles: File[]) => void;
  /** Sets a callback function that is triggered when a draggable selection is dragged over the target */
  onDragOver?: (isDragActive: boolean, e: React.DragEvent<HTMLElement>) => void;
  /** Sets a callback function that is triggered when a draggable selection leaves the drop target */
  onDragLeave?: (e: React.DragEvent<HTMLElement>) => void;
  targetFile?: Function;
  style?: React.CSSProperties;
}
