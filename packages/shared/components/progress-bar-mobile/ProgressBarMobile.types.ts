export interface ProgressBarMobileProps {
  /** Display text for the progress bar */
  label: string;
  /** Status text to display */
  status?: string;
  /** Progress completion percentage */
  percent?: number;
  /** Alert status */
  alert?: boolean;
  /** Controls visibility of the progress bar */
  open?: boolean;
  /** The function that facilitates hiding the button */
  hideButton?: () => void;
  /** The function called after the progress header is clicked */
  onClickAction?: () => void;
  /** The function called after the progress header is clicked */
  onClickHeaderAction?: () => void;
  /** Changes the progress bar color, if set to true */
  error?: boolean;
  /** Hides the progress bar */
  withoutProgress?: boolean;
  /** Icon URL or component */
  iconUrl?: string;
  /** Indicates if the operation is completed */
  completed?: boolean;
  /** Callback function for clearing progress */
  onClearProgress?: (operationId: string, operation: string) => void;
  /** Unique identifier for the operation */
  operationId?: string;
  /** Type of operation */
  operation?: string;
}
