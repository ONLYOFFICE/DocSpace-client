export interface ProgressBarProps {
  /** Progress value in %. Max value 100% */
  percent: number;
  /** Text in progress-bar. */
  label?: string;
  /** Show infinite progress */
  isInfiniteProgress?: boolean;
}
