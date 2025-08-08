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

export interface Operation {
  operation: string;
  label: string;
  alert: boolean;
  completed: boolean;
  percent?: number;
  withoutStatus?: boolean;
  showPanel?: (open: boolean) => void;
  withoutProgress?: boolean;
  items?: Array<{
    operationId: string;
    percent: number;
  }>;
  errorCount?: number;
  dragged?: string | null;
}

export interface OperationsProgressProps {
  panelOperations?: Operation[];
  operations?: Operation[];
  operationsAlert?: boolean;
  operationsCompleted?: boolean;
  clearOperationsData?: (
    operationId?: string | null,
    operation?: string | null,
  ) => void;
  clearPanelOperationsData?: (operation?: string | null) => void;
  clearDropPreviewLocation?: () => void;
  cancelUpload?: (t: (key: string) => string) => void;
  onOpenPanel?: () => void;
  mainButtonVisible?: boolean;
  needErrorChecking?: boolean;
  showCancelButton?: boolean;
  onCancelOperation?: (callback: () => void) => void;
  percent?: number;
  isInfoPanelVisible?: boolean;
  dropTargetFolderName?: string | null;
  isDragging?: boolean;
  isArticleExpanded?: boolean;
}
export interface ProgressBarMobileProps {
  /** Display text for the progress bar */
  label?: string;
  /** Alert status */
  alert?: boolean;
  /** Status text to display */
  status?: string;
  /** Progress completion percentage */
  percent?: number;
  /** Controls visibility of the progress bar */
  open?: boolean;
  /** The function that facilitates hiding the button */
  onCancel?: () => void;
  /** Icon URL or component */
  icon?: React.ReactNode;
  /** The function called after the progress header is clicked */
  onClickAction?: () => void;
  /** The function that facilitates hiding the button */
  hideButton?: () => void;
  /** Changes the progress bar color, if set to true */
  error?: boolean;
  /** Hides the progress bar */
  withoutProgress?: boolean;
  /** Icon URL */
  iconUrl?: string;
  /** Indicates if the operation is completed */
  completed?: boolean;
  /** Callback function for clearing progress */
  onClearProgress?: (operationId: string | null, operation: string) => void;
  /** Unique identifier for the operation */
  operationId?: string;
  /** Type of operation */
  operation?: string;
  /** The function called after the progress header is clicked */
  onOpenPanel?: () => void;
  withoutStatus?: boolean;
}
