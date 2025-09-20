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

import { AsideHeaderProps } from "../aside-header";

import { ModalDialogType } from "./ModalDialog.enums";

export type ModalDialogTypeDetailed = {
  mobile: ModalDialogType;
  tablet: ModalDialogType;
  desktop: ModalDialogType;
};

export type ModalSubComponentsProps = AsideHeaderProps & {
  /** Unique identifier for the modal */
  id?: string;
  /** Custom styles for the modal */
  style?: React.CSSProperties;
  /** Additional CSS classes */
  className?: string;
  /** Current display type of the modal (modal or aside) */
  currentDisplayType: ModalDialogType;
  /** **`ASIDE-ONLY`** Enables body scroll */
  withBodyScroll?: boolean;
  /** **`ASIDE-ONLY`** Locks the scroll in body section */
  isScrollLocked?: boolean;
  /** **`MODAL-ONLY`** Sets width: 520px and max-height: 400px */
  isLarge: boolean;
  /** **`MODAL-ONLY`** Sets predefined huge size */
  isHuge: boolean;
  /** CSS z-index for modal layering */
  zIndex?: number;
  /** **`MODAL-ONLY`** Sets max-height: auto */
  autoMaxHeight?: boolean;
  /** **`MODAL-ONLY`** Sets max-width: auto */
  autoMaxWidth?: boolean;
  /** Callback function when modal is closed */
  onClose: () => void;
  /** Shows loader in body */
  isLoading?: boolean;
  /** Content for the modal header */
  header?: React.ReactNode;
  /** Content for the modal body */
  body?: React.ReactNode;
  /** Content for the modal footer */
  footer?: React.ReactNode;
  /** Container content for aside mode */
  container?: React.ReactNode;
  /** Controls modal visibility */
  visible?: boolean;
  /** **`MODAL-ONLY`** Displays border between body and footer */
  withFooterBorder: boolean;
  /** Offset for modal swipe animation */
  modalSwipeOffset?: number;
  /** **`ASIDE-ONLY`** Allows embedding modal as aside dialog inside parent container */
  containerVisible?: boolean;
  /** Displays double line in footer */
  isDoubleFooterLine?: boolean;
  /** Sets the displayed dialog to be closed or open */
  isCloseable?: boolean;
  /** Enables embedded mode */
  embedded?: boolean;
  /** Wraps content in form element */
  withForm?: boolean;
  /** Form submit handler */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Removes default padding from body */
  withoutPadding?: boolean;
  /** Removes default margin from header */
  withoutHeaderMargin?: boolean;
  /** Hides modal content */
  hideContent?: boolean;
  /** Sets backdrop blur value */
  blur?: number;
  /** Shows invite panel loader */
  isInvitePanelLoader?: boolean;
  /** Forces body scroll regardless of display type */
  withBodyScrollForcibly?: boolean;

  withBorder?: boolean;
  /** Test id */
  dataTestId?: string;
  /** Controls the visibility of the backdrop overlay */
  backdropVisible?: boolean;
};

export type ModalDialogProps = Partial<
  Omit<
    ModalSubComponentsProps,
    "currentDisplayType" | "header" | "body" | "footer" | "container"
  >
> & {
  /** Displays the child elements */
  children: (React.ReactElement | null)[] | React.ReactElement;
  /** Displays type */
  displayType?: ModalDialogType;
  /** Detailed display type for each dimension */
  displayTypeDetailed?: ModalDialogTypeDetailed;
  /** Test id */
  dataTestId?: string;
};

export type ModalDialogFormWrapperProps = {
  withForm: boolean;
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

export type ModalDialogBackdropProps = {
  className?: string;
  children: React.ReactNode | React.ReactElement[] | React.ReactElement;
  zIndex?: number;
};
