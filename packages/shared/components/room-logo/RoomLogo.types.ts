import { RoomsType } from "../../enums";

export interface RoomLogoProps {
  /** Accepts room type */
  type: RoomsType;
  /** Adds privacy icon  */
  isPrivacy?: boolean;
  /** Adds archive icon  */
  isArchive?: boolean;
  /** Adds checkbox when row/tile is hovered or checked  */
  withCheckbox?: boolean;
  /** Sets a checked state of the checkbox  */
  isChecked?: boolean;
  /** Sets an indeterminate state of the checkbox  */
  isIndeterminate?: boolean;
  /** Sets onChange checkbox callback function */
  onChange?: () => void;
  /** Accepts id  */
  id?: string;
  /** Accepts class name  */
  className?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
}
