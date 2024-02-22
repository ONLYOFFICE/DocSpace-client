import {
  TAccessRight,
  TSelectorHeader,
} from "../../components/selector/Selector.types";
import { TSelectorItem } from "../../components/selector";

export type GroupsSelectorProps = TSelectorHeader & {
  id?: string;
  className?: string;
  onSubmit: (
    selectedItems: TSelectorItem[],
    access?: TAccessRight | null,
    fileName?: string,
    isFooterCheckboxChecked?: boolean,
  ) => void;
};

export type GroupsSelectorItem = Pick<TSelectorItem, "id" | "label">;
