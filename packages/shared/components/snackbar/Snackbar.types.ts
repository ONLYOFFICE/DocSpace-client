export interface SnackbarProps {
  /** Specifies the Snackbar text */
  text?: string | React.ReactNode;
  /** Specifies the header text */
  headerText?: string;
  /** Specifies the button text */
  btnText?: string;
  /** Specifies the source of the image used as the Snackbar background  */
  backgroundImg?: string;
  /** Specifies the background color */
  backgroundColor?: string;
  /** Specifies the text color */
  textColor?: string;
  /** Displays the icon */
  showIcon?: boolean;
  /** Sets a callback function that is triggered when the Snackbar is clicked */
  onAction?: (e?: React.MouseEvent) => void;
  /** Sets the font size  */
  fontSize?: string;
  /** Sets the font weight */
  fontWeight?: number;
  /** Specifies the text alignment */
  textAlign?:
    | "start"
    | "end"
    | "left"
    | "right"
    | "center"
    | "justify"
    | "match-parent";
  /** Allows displaying content in HTML format */
  htmlContent?: string;
  /** Accepts css */
  style?: React.CSSProperties;
  /** Sets the countdown time */
  countDownTime: number;
  /** Sets the section width */
  sectionWidth: number;
  /** Required in case the snackbar is a campaign banner */
  isCampaigns?: boolean;
  /** Used as an indicator that a web page has fully loaded, including its content, images, style files, and external scripts */
  onLoad?: () => void;
  /** Required in case the snackbar is a notification banner */
  isMaintenance?: boolean;
  /** Sets opacity */
  opacity?: number;
  onClose?: () => void;
}

export interface BarConfig extends SnackbarProps {
  parentElementId: string;
}
