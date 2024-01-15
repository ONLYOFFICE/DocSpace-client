export interface ArticleItemProps {
  /** Accepts className */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Catalog item icon */
  icon: string;
  /** Catalog item text */
  text: string;
  /** Sets the catalog item to display text */
  showText?: boolean;
  /** Invokes a function upon clicking on a catalog item */
  onClick?: (id?: string) => void;
  /** Invokes a function upon dragging and dropping a catalog item */
  onDrop?: (id?: string, text?: string) => void;
  /** Tells when the catalog item should display initial on icon, text should be hidden */
  showInitial?: boolean;
  /** Sets the catalog item as end of block */
  isEndOfBlock?: boolean;
  /** Sets catalog item active */
  isActive?: boolean;
  /** Sets the catalog item available for drag`n`drop */
  isDragging?: boolean;
  /** Sets the catalog item active for drag`n`drop */
  isDragActive?: boolean;
  /** Sets the catalog item to display badge */
  showBadge?: boolean;
  /** Label in catalog item badge */
  labelBadge?: string | number;
  /** Sets custom badge icon */
  iconBadge?: string;
  /** Invokes a function upon clicking on the catalog item badge */
  onClickBadge?: (id?: string) => void;
  /** Sets the catalog item to be displayed as a header */
  isHeader?: boolean;
  /** Disables margin top for catalog item header */
  isFirstHeader?: boolean;
  /** Accepts folder id */
  folderId?: string;
  badgeTitle?: string;
}
