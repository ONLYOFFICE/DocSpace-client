export interface AsideProps {
  visible: boolean;
  scale?: boolean;
  className?: string;
  contentPaddingBottom?: string;
  zIndex?: number;
  children: React.ReactNode;
  withoutBodyScroll?: boolean;
  onClose: () => void;
}

export interface StyledAsideProps {
  visible: boolean;
  scale?: boolean;
  zIndex?: number;
  contentPaddingBottom?: string;
  forwardRef?: React.LegacyRef<HTMLElement>;
  children: React.ReactNode;
  className: string;
}
