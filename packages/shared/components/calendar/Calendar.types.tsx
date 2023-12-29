import moment from "moment";

export interface CalendarProps {
  /** Class name */
  className?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Specifies the calendar locale */
  locale: string;
  /** Value of selected date (moment object) */
  selectedDate: moment.Moment;
  /** Allows handling the changing events of the component */
  onChange?: (formattedDate: moment.Moment) => void;
  /** Changes the selected date state */
  setSelectedDate?: (formattedDate: moment.Moment) => void;
  /** Specifies the minimum selectable date */
  minDate: moment.Moment | Date;
  /** Specifies the maximum selectable date */
  maxDate: moment.Moment | Date;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** First shown date */
  initialDate?: moment.Moment;
  isMobile?: boolean;
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export interface DaysProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  handleDateChange: (date: moment.Moment) => void;
  selectedDate: moment.Moment;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface DaysHeaderProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface DaysBodyProps {
  observedDate: moment.Moment;
  handleDateChange: (date: moment.Moment) => void;
  selectedDate: moment.Moment;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface HeaderButtonsProps {
  onLeftClick: React.MouseEventHandler<HTMLButtonElement>;
  onRightClick: React.MouseEventHandler<HTMLButtonElement>;
  isLeftDisabled: boolean;
  isRightDisabled: boolean;
  isMobile: boolean;
}

export interface MonthsProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  selectedDate: moment.Moment;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface MonthsBodyProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  selectedDate: moment.Moment;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface MonthsHeaderProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface YearsProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  selectedDate: moment.Moment;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}

export interface YearsHeaderProps {
  observedDate: moment.Moment;
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  isMobile: boolean;
}
