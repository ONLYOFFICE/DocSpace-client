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

export interface SaveCancelButtonProps {
  /** Accepts css id */
  id?: string;
  /** Accepts css class */
  className?: string;
  /** Message text that notifies of the unsaved changes */
  reminderText?: string;
  /** Save button label */
  saveButtonLabel?: string;
  /** Cancel button label  */
  cancelButtonLabel?: string;
  /** Sets a callback function that is triggered when the save button is clicked */
  onSaveClick?: () => void;
  /** Sets a callback function that is triggered when the cancel button is clicked */
  onCancelClick?: () => void;
  /** Reminder message that notifies of the unsaved changes (Only shown on desktops) */
  showReminder?: boolean;
  /** Sets save and cancel buttons block to 'position: static' instead of absolute */
  displaySettings?: boolean;
  /** Displays the scrollbar */
  hasScroll?: boolean;
  /** Sets the min width of the button */
  minwidth?: string;
  /** Sets the Cancel button disabled by default */
  disableRestoreToDefault?: boolean;
  /** Sets the button to present a disabled state while executing an operation after clicking the save button */
  isSaving?: boolean;
  /** Activates the disabled button */
  cancelEnable?: boolean;
  /** Accepts css tab-index */
  tabIndex?: number;
  /** Hide top border */
  hideBorder?: boolean;
  additionalClassSaveButton?: string;
  additionalClassCancelButton?: string;
  saveButtonDisabled?: boolean;
  getTopComponent?: () => React.ReactNode;
}
