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

import { AsideHeaderProps } from "../aside/Aside.types";
import { ModalDialogType } from "./ModalDialog.enums";

export type ModalDialogTypeDetailed = {
  mobile: ModalDialogType;
  tablet: ModalDialogType;
  desktop: ModalDialogType;
};

export interface ModalDialogProps {
  /** Accepts id */
  id?: string;
  /** Accepts class */
  className?: string;
  /** CSS z-index   */
  zIndex?: number;
  /** Accepts css */
  style?: React.CSSProperties;
  /** Displays the child elements */
  children: React.ReactElement[] | React.ReactElement;
  /** Sets the dialog to display */
  visible?: boolean;
  /** Sets a callback function that is triggered when the close button is clicked */
  onClose?: () => void;
  /** Displays type */
  displayType: ModalDialogType;
  /** Detailed display type for each dimension */
  displayTypeDetailed?: ModalDialogTypeDetailed;
  /** Shows loader in body */
  isLoading?: boolean;
  /** Sets the displayed dialog to be closed or open */
  isCloseable?: boolean;

  /** **`MODAL-ONLY`**
  Sets `width: 520px` and `max-height: 400px` */
  isLarge?: boolean;
  isHuge?: boolean;

  /** **`MODAL-ONLY`**
  Sets `max-width: auto` */
  autoMaxWidth?: boolean;
  /** **`MODAL-ONLY`**
  Sets `max-height: auto` */
  autoMaxHeight?: boolean;

  /** **`MODAL-ONLY`**
  Displays border betweeen body and footer` */
  withFooterBorder?: boolean;

  /** **`ASIDE-ONLY`**
  Enables Body scroll */
  withBodyScroll?: boolean;

  /** **`ASIDE-ONLY`**
  Enables body scroll */
  isScrollLocked?: boolean;

  /** **`ASIDE-ONLY`**
  Sets modal dialog size equal to window */
  scale?: boolean;

  /** **`ASIDE-ONLY`**
  Allows you to embed a modal window as an aside dialog inside the parent container without applying a dialog layout to it */
  containerVisible?: boolean;

  isDoubleFooterLine?: boolean;
  embedded?: boolean;
  withForm?: boolean;
  withoutPadding?: boolean;
  hideContent?: boolean;
  blur?: number;
  isInvitePanelLoader?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export interface ModalProps {
  id?: string;
  className?: string;
  zIndex?: number;
  style?: React.CSSProperties;
  onClose: () => void;
  visible: boolean;
  modalSwipeOffset?: number;

  isLoading?: boolean;
  modalLoaderBodyHeight?: string;

  currentDisplayType?: ModalDialogType;
  isLarge?: boolean;

  header?: object;
  body?: object;
  footer?: object;
}

export interface ModalDialogCloseButtonProps {
  currentDisplayType: ModalDialogType;

  onClick: () => void;
}

export interface ModalDialogFormWrapperProps {
  withForm: boolean;
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export interface ModalDialogBackdropProps {
  id?: string;
  className?: string;
  children: React.ReactNode | React.ReactElement[] | React.ReactElement;
  zIndex?: number;
  visible?: boolean;
  modalSwipeOffset?: number;
}

export type ModalSubComponentsProps = AsideHeaderProps & {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  currentDisplayType: ModalDialogType;
  withBodyScroll?: boolean;
  isScrollLocked?: boolean;
  isLarge: boolean;
  isHuge: boolean;
  zIndex?: number;
  autoMaxHeight?: boolean;
  autoMaxWidth?: boolean;
  onClose: () => void;
  isLoading?: boolean;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  container?: React.ReactNode;
  visible?: boolean;
  withFooterBorder: boolean;
  modalSwipeOffset?: number;
  containerVisible?: boolean;
  isDoubleFooterLine?: boolean;
  isCloseable?: boolean;
  embedded?: boolean;
  withForm?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  withoutPadding?: boolean;
  hideContent?: boolean;
  blur?: number;
  isInvitePanelLoader?: boolean;
  withBodyScrollForcibly?: boolean;
};
