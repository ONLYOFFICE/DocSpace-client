export type TViewSelectorOption = {
  value: string;
  icon: string;
  id?: string;
  callback?: () => void;
};

export interface ViewSelectorProps {
  /** Disables the button default functionality */
  isDisabled: boolean;
  /** Sets a callback function that is triggered when the button is clicked */
  onChangeView: (view: string) => void;
  /** Array that contains the view settings  */
  viewSettings: TViewSelectorOption[];
  /** Current application view */
  viewAs: string;
  /** Displays only available selector options  */
  isFilter: boolean;
}
