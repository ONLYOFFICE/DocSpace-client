export interface ToggleContentProps {
  /** Displays the child elements */
  children: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts id  */
  id?: string;
  /** Displays the component's state */
  isOpen: boolean;
  /** Sets the header label */
  label: string;
  /** The change event is triggered when the element's value is modified */
  onChange?: (checked: boolean) => void;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Enables/disables toggle */
  enableToggle?: boolean;
}
