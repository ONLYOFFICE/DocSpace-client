import { TViewAs } from "../../types";

export type TOnMove = {
  added: Element[];
  removed: Element[];
  clear?: boolean;
};

export type TArrayTypes = {
  type: string;
  rowGap?: number;
  itemHeight: number;
  countOfMissingTiles?: number;
  rowCount?: number;
};

export interface SelectionAreaProps {
  containerClass: string;
  selectableClass: string;
  onMove?: ({ added, removed, clear }: TOnMove) => void;
  scrollClass: string;
  viewAs: TViewAs;
  itemsContainerClass: string;
  isRooms: boolean;
  folderHeaderHeight: number;
  countTilesInRow: number;
  defaultHeaderHeight: number;
  arrayTypes: TArrayTypes[];
  itemClass: string;
}
