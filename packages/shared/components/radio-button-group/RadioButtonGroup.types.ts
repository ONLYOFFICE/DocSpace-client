export type TRadioButtonOption = {
  value: string;
  label?: string | React.ReactNode;
  disabled?: boolean;
  id?: string;
  type?: string;
};

export interface RadioButtonGroupProps {
  /** Disables all radiobuttons in the group */
  isDisabled?: boolean;
  /** Used as HTML `value` property for `<input>` tag. Facilitates identification of each RadioButtonGroup */
  name?: string;
  /** Allows handling clicking events on `<RadioButton />` component */
  onClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Array of objects, contains props for each `<RadioButton />` component */
  options: TRadioButtonOption[];
  /** Value of the selected radiobutton */
  selected?: string;
  /** Sets margin between radiobuttons. In case the orientation is `horizontal`, `margin-left` is applied for all radiobuttons,
   * except the first one. If the orientation is `vertical`, `margin-bottom` is applied for all radiobuttons, except the last one */
  spacing?: string;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Position of radiobuttons  */
  orientation: "horizontal" | "vertical";
  /** Width of RadioButtonGroup container */
  width?: string;
  /** Link font size */
  fontSize?: string;
  /** Link font weight  */
  fontWeight?: number;
}
