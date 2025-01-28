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
}
