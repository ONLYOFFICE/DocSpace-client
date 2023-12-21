interface CronProps {
  /** Cron value */
  value?: string;
  /** Set the cron value, similar to onChange. */
  setValue: (value: string) => void;
  /** Triggered when the cron component detects an error with the value. */
  onError?: (error?: Error) => void;
}

export default CronProps;
