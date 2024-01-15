export type TData = {
  id: string | number;
  displayName: string;
  role: string;
  startFillingStatus: string;
  startFillingDate: Date | string;
  filledAndSignedStatus: string;
  filledAndSignedDate: Date | string;
  returnedByUser?: string | null;
  returnedByUserDate: Date | string;
  comment: string | null;
  avatar: string | null;
};

export interface FillingStatusLineProps {
  /** Accepts id */
  id: string;
  /** Accepts class */
  className: string;
  /** Filling status done text */
  statusDoneText: string;
  /** Filling status interrupted text */
  statusInterruptedText: string;
  /** Filling status done */
  statusDone: boolean;
  /** Filling status interrupted */
  statusInterrupted: boolean;
}

export interface FillingStatusLineAccordionProps {
  id?: string | number;
  displayName: string;
  role: string;
  startFilling: string;
  startFillingDate: string;
  filledAndSigned: string;
  filledAndSignedDate: string;
  returnedByUser?: string | null;
  returnedDate: string | null;
  comment?: string | null;
  avatar: string | null;

  isDone?: boolean;
  isInterrupted?: boolean;
}
