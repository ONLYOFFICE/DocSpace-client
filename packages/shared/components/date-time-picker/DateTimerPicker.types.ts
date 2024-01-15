export interface DateTimePickerProps {
  /** Date object */
  initialDate?: moment.Moment | Date;
  /** Select date text */
  selectDateText: string;
  /** Allows to set classname */
  className: string;
  /** Allows to set id */
  id: string;
  /** Allow you to handle changing events of component */
  onChange: (d: null | moment.Moment) => void;
  /** Specifies min choosable calendar date */
  minDate?: moment.Moment | Date;
  /** Specifies max choosable calendar date */
  maxDate?: moment.Moment | Date;
  /** Specifies calendar locale */
  locale: string;
  /** Indicates the input field has an error  */
  hasError: boolean;
  /** Allows to set first shown date in calendar */
  openDate: moment.Moment;
}
