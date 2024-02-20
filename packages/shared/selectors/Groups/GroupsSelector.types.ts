import { SelectorProps, TSelectorItem } from "../../components/selector";

type PickedSelectorProps = Pick<
  SelectorProps,
  | "id"
  | "headerLabel"
  | "className"
  | "onBackClick"
  | "onCancel"
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
  onAccept?: (items: GroupsSelectorItem[]) => void;
  onSelect?: (item: GroupsSelectorItem) => void;
}

export type GroupsSelectorItem = Pick<TSelectorItem, "id" | "label">;
