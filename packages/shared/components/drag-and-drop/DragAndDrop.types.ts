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
  /** Needs for selection area and DND work */
  value?: string;
  targetFile?: Function;
  style?: React.CSSProperties;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
}
