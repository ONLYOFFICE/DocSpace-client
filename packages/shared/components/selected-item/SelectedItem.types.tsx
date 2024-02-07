import { FilterGroups } from "../../enums";

type TLabel = string | React.ReactNode;

export interface SelectedItemProps {
  /** Selected item text */
  label: TLabel;
  /** Sets the 'width: fit-content' property */
  isInline?: boolean;
  /** Sets a callback function that is triggered when the cross icon is clicked */
  onClose: (
    propKey: string,
    label: TLabel,
    group?: string | FilterGroups,
    e?: React.MouseEvent,
  ) => void;
  /** Sets a callback function that is triggered when the selected item is clicked */
  onClick?: (
    propKey: string,
    label: TLabel,
    group?: string | FilterGroups,
    e?: React.MouseEvent<HTMLDivElement>,
  ) => void;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Accepts class  */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Accepts key to remove item */
  propKey: string;
  /** Accepts group key to remove item */
  group?: string;
  /** Passes ref to component */
  forwardedRef?: React.RefObject<HTMLDivElement>;
  classNameCloseButton?: string;
  hideCross?: boolean;
}
