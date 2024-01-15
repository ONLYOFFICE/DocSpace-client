export interface TagProps {
  /** Accepts the tag id */
  tag: string;
  /** Accepts the tag label */
  label?: string;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Accepts the tag styles as new and adds the delete button */
  isNewTag?: boolean;
  /** Accepts the tag styles as disabled and disables clicking */
  isDisabled?: boolean;
  /** Accepts the function that is called when the tag is clicked */
  onClick: (tag?: string) => void;
  /** Accepts the function that ist called when the tag delete button is clicked */
  onDelete?: (tag?: string) => void;
  /** Accepts the max width of the tag */
  tagMaxWidth?: string;
  /** Accepts the dropdown options */
  advancedOptions?: React.ReactNode[];
  icon?: string;
  isDefault?: boolean;
  isLast?: boolean;
}
