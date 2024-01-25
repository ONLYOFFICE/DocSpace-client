export interface AlertComponentProps {
  id?: string;
  description?: string;
  title?: string;
  titleFontSize?: string;
  additionalDescription?: string;
  needArrowIcon?: boolean;
  needCloseIcon?: boolean;
  link?: string;
  onLinkClick?: () => void;
  linkColor?: string;
  linkTitle?: string;
  onAlertClick?: () => void;
  onCloseClick?: () => void;
  titleColor?: string;
  borderColor: string;
}
