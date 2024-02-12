export interface PlayerTimelineProps {
  value: number;
  duration: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMouseEnter: VoidFunction;
  onMouseLeave: VoidFunction;
}

export interface PlayerTimelineRef {
  setProgress: (value: number) => void;
}
