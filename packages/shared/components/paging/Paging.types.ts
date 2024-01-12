import { TOption } from "../combobox";

export interface PagingProps {
  /** Label for the previous button */
  previousLabel: string;
  /** Label for the next button */
  nextLabel: string;
  /** Action for the previous button */
  previousAction: (e?: React.MouseEvent) => Promise<void>;
  /** Action for the next button */
  nextAction: (e?: React.MouseEvent) => Promise<void>;
  /** Sets previous button disabled */
  disablePrevious: boolean;
  /** Sets the next button disabled */
  disableNext: boolean;
  /** Disables the hover action for buttons */
  disableHover: boolean;
  /** Initial value for pageItems */
  selectedPageItem: TOption;
  /** Initial value for countItems */
  selectedCountItem: TOption;
  /** Sets a callback function that is triggered when the page is selected */
  onSelectPage: (option: TOption) => Promise<void>;
  /** Sets a callback function that is triggered when the page items are selected */
  onSelectCount: (option: TOption) => Promise<void>;
  /** Paging combo box items */
  pageItems: TOption[];
  /** Items per page combo box items */
  countItems: TOption[];
  /** Indicates opening direction of combo box */
  openDirection: "bottom" | "top" | "both";
  /** Accepts class */
  className: string;
  /** Accepts id */
  id: string;
  /** Accepts css style */
  style: React.CSSProperties;
  /** Displays a combobox with the number of items per page */
  showCountItem: boolean;
}
