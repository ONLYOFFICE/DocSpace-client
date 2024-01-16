import { SelectorProps } from "@docspace/shared/components/selector/Selector.types";

type PickedSelectorProps = Pick<
  SelectorProps,
  | "id"
  | "headerLabel"
  | "className"
  | "onBackClick"
  | "isMultiSelect"
  | "cancelButtonLabel"
  | "emptyScreenDescription"
  | "emptyScreenHeader"
  | "emptyScreenImage"
  | "withCancelButton"
  | "withHeader"
  | "searchEmptyScreenDescription"
  | "searchEmptyScreenHeader"
  | "searchEmptyScreenImage"
  | "searchPlaceholder"
>;

export interface GroupsSelectorProps extends PickedSelectorProps {
  onAccept?: (items: GroupsSelectorItem) => void;
  onSelect?: (item: GroupsSelectorItem) => void;
}

export interface GroupsSelectorItem {
  id: string;
  label: string;
}
