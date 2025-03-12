export type VirtualListProps = {
  width: number;
  isOpen?: boolean;
  itemCount: number;
  maxHeight?: number;
  listHeight: number;
  isNoFixedHeightOptions?: boolean;
  cleanChildren?: React.ReactNode;
  children: React.ReactElement | React.ReactNode;
  enableKeyboardEvents?: boolean;
  getItemSize: (index: number) => number;
};
