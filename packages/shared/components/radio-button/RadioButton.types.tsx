export interface RadioButtonProps {
  /** Used as HTML `checked` property for each `<input>` tag */
  isChecked?: boolean;
  /** Used as HTML `disabled` property for each `<input>` tag */
  isDisabled?: boolean;
  /** Radiobutton name. In case the name is not stated, `value` is used */
  label?: React.ReactNode | string;
  /** Link font size */
  fontSize?: string;
  /** Link font weight */
  fontWeight?: number;
  /** Used as HTML `name` property for `<input>` tag. */
  name: string;
  /** Allows handling the changing events of the component  */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Allows handling component clicking events */
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Used as HTML `value` property for `<input>` tag. Facilitates identification of each radiobutton  */
  value: string;
  /** Sets margin between radiobuttons. In case the orientation is `horizontal`,
   * `margin-left` is applied for all radiobuttons, except the first one.
   * In case the orientation is `vertical`, `margin-bottom` is applied for all radiobuttons, except the last one */
  spacing?: string;
  /** Accepts class  */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Position of radiobuttons */
  orientation?: "horizontal" | "vertical";
  classNameInput?: string;
}
