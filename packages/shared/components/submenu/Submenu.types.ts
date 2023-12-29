export type TSubmenuItem = {
  id: string;
  name: string;
  content: React.ReactNode;
  onClick?: () => void;
};

export interface SubmenuProps {
  /** List of the elements */
  data: TSubmenuItem[];
  /** Specifies the first item or the item's index to be displayed in the submenu. */
  startSelect: number | TSubmenuItem;
  /** Property that allows explicitly selecting content passed through an external operation  */
  forsedActiveItemId?: number;
  /** Sets a callback function that is triggered when the submenu item is selected */
  onSelect?: (item: TSubmenuItem) => void;
  topProps?: string;
}
