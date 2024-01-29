export type TagType = {
  key?: string;
  isDefault?: boolean;
  isThirdParty?: boolean;
  /** Accepts the tag label */
  label: string;
  /** Accepts the max width of the tag */
  maxWidth?: string;
  /** Accepts the dropdown options */
  advancedOptions?: React.ReactNode[];
  /** Accepts the tag styles as disabled and disables clicking */
  isDisabled?: boolean;
};

export interface TagsProps {
  /** Accepts id */
  id?: string;
  /** Accepts the tags */
  tags: Array<TagType | string>;
  /** Accepts class */
  className?: string;
  /** Accepts the tag column count */
  columnCount: number;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Accepts the function that is called when the tag is selected */
  onSelectTag: (tag?: string) => void;
}
