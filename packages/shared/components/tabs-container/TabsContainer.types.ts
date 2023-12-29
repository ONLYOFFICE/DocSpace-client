export type TElement = {
  id?: string;
  key: string;
  title: string;
  content: React.ReactNode;
};

export interface TabsContainerProps {
  /** Child elements */
  elements: TElement[];
  /** Disables the TabContainer  */
  isDisabled: boolean;
  /** Sets a callback function that is triggered when the title is selected */
  onSelect: (element: TElement) => void;
  /** Selected title of tabs container */
  selectedItem: number;
}
