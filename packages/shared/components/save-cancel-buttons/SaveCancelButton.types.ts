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

import { ReactNode } from "react";

export type SaveCancelButtonProps = {
  /** HTML id attribute */
  id?: string;

  /** Additional CSS class names */
  className?: string;

  /** Text displayed to notify users of unsaved changes */
  reminderText?: string;

  /** Label for the save button */
  saveButtonLabel?: string;

  /** Label for the cancel button */
  cancelButtonLabel?: string;

  /** Callback function triggered when the save button is clicked */
  onSaveClick?: () => void;

  /** Callback function triggered when the cancel button is clicked */
  onCancelClick?: () => void;

  /** Controls visibility of the reminder message (desktop only) */
  showReminder?: boolean;

  /** When true, buttons use static positioning instead of absolute */
  displaySettings?: boolean;

  /** Controls scrollbar visibility */
  hasScroll?: boolean;

  /** Minimum width for the buttons */
  minwidth?: string;

  /** Disables the restore to default functionality */
  disableRestoreToDefault?: boolean;

  /** Shows loading state on save button during async operations */
  isSaving?: boolean;

  /** Explicitly enables the cancel button regardless of other states */
  cancelEnable?: boolean;

  /** Tab index for keyboard navigation */
  tabIndex?: number;

  /** When true, hides the top border */
  hideBorder?: boolean;

  /** Additional CSS class for the save button */
  additionalClassSaveButton?: string;

  /** Additional CSS class for the cancel button */
  additionalClassCancelButton?: string;

  /** Disables the save button */
  saveButtonDisabled?: boolean;

  /** Function that returns a component to be rendered above the buttons */
  getTopComponent?: () => ReactNode;

  /** Save button data-testid */
  saveButtonDataTestId?: string;
  /** Canbel button data-testid */
  cancelButtonDataTestId?: string;
};
