import { IndexRange } from "react-virtualized";
import { TViewAs } from "../../types";

export interface InfiniteLoaderProps {
  viewAs: TViewAs;
  hasMoreFiles: boolean;
  filesLength: number;
  itemCount: number;
  loadMoreItems: (params: IndexRange) => Promise<void>;
  itemSize?: number;
  children: React.ReactNode[];
  onScroll?: () => void;
  isLoading?: boolean;
  columnStorageName?: string;
  columnInfoPanelStorageName?: string;
  className?: string;
  infoPanelVisible?: boolean;
  countTilesInRow?: number;
}

export interface ListComponentProps extends InfiniteLoaderProps {
  scroll: Element | (Window & typeof globalThis);
}

export interface GridComponentProps extends InfiniteLoaderProps {
  scroll: Element | (Window & typeof globalThis);
}
