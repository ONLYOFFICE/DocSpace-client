export interface GroupsSelectorProps {
  id?: string;
  headerLabel?: string;
  className?: string;
  onBackClick?: () => void;
  onAccept: (items: GroupsSelectorItem) => void;
}

export interface GroupsSelectorItem {
  id: string;
  label: string;
}
