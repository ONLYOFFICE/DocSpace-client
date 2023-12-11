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
  children: React.ReactElement;
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
  Sets `width: 520px` and `max-height: 400px`*/
  isLarge?: boolean;

  /** **`MODAL-ONLY`**
  Sets `max-width: auto`*/
  autoMaxWidth?: boolean;
  /** **`MODAL-ONLY`**
  Sets `max-height: auto`*/
  autoMaxHeight?: boolean;

  /** **`MODAL-ONLY`**
  Displays border betweeen body and footer`*/
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
}

export interface ModalDialogBackdropProps {
  id?: string;
  className?: string;
  children: React.ReactNode | React.ReactElement;
  zIndex?: number;
  visible?: boolean;
  modalSwipeOffset?: number;
}
