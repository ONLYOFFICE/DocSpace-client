import moment from "moment";

export interface DatePickerProps {
  /** Allows to change select date text */
  selectDateText?: string;
  /** Selected date */
  initialDate?: moment.Moment | Date;
  /** Allow you to handle changing events of component */
  onChange: (d: null | moment.Moment) => void;
  /** Allows to set classname */
  className?: string;
  /** Allows to set id */
  id?: string;
  /** Specifies min choosable calendar date */
  minDate?: moment.Moment | Date;
  /** Specifies max choosable calendar date */
  maxDate?: moment.Moment | Date;
  /** Specifies calendar locale */
  locale: string;
  /** Shows calendar icon in selected item */
  showCalendarIcon?: boolean;
  /** Allows to track date outside the component */
  outerDate?: moment.Moment;
  /** Allows to set first shown date in calendar */
  openDate: moment.Moment;
  isMobile?: boolean;
}
