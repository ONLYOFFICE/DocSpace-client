export interface EmptyScreenContainerProps {
  /** Image url source */
  imageSrc: string;
  /** Alternative image text */
  imageAlt: string;
  /** Header text */
  headerText: string;
  /** Subheading text */
  subheadingText?: string;
  /** Description text */
  descriptionText?: string | React.ReactNode;
  /** Content of EmptyContentButtonsContainer */
  buttons?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  withoutFilter?: boolean;
}
