import React, { useRef, useState, useEffect } from "react";
import moment from "moment";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";

import Text from "../text";
import SelectorAddButton from "../selector-add-button";
import SelectedItem from "../selected-item";
import Calendar from "../calendar";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/calendar.rea... Remove this comment to see the full error message
import CalendarIconUrl from "PUBLIC_DIR/images/calendar.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/calendar.rea... Remove this comment to see the full error message
import CalendarIcon from "PUBLIC_DIR/images/calendar.react.svg";
import { mobile } from "../utils/device";

const Wrapper = styled.div`
  .selectedItem {
    cursor: pointer;
    .calendarIcon {
      width: 12px;
      height: 12px;
      padding: 0 10px 0 2px;
      path {
        fill: #657077;
      }
    }
  }
`;

const DateSelector = styled.div`
  width: fit-content;
  cursor: pointer;

  display: flex;
  align-items: center;

  .mr-8 {
    margin-right: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-right: 0px;
        margin-left: 8px;
      `}
  }
`;

const SelectedLabel = styled.span`
  display: flex;
  align-items: center;
`;

const StyledCalendar = styled(Calendar)`
  position: absolute;

  @media ${mobile} {
    position: fixed;
    bottom: 0;
    left: 0;
  }
`;

const DatePicker = (props: any) => {
  const {
    initialDate,
    onChange,
    selectDateText,
    className,
    id,
    minDate,
    maxDate,
    locale,
    showCalendarIcon,
    outerDate,
    openDate,
    isMobile,
  } = props;

  const calendarRef = useRef();
  const selectorRef = useRef();
  const selectedItemRef = useRef();

  const [date, setDate] = useState(initialDate ? moment(initialDate) : null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleCalendar = () =>
    setIsCalendarOpen((prevIsCalendarOpen) => !prevIsCalendarOpen);

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleChange = (date: any) => {
    onChange && onChange(date);
    setDate(date);
    closeCalendar();
  };

  const deleteSelectedDate = (propKey: any, label: any, group: any, e: any) => {
    e.stopPropagation();
    handleChange(null);
    setIsCalendarOpen(false);
  };
  const CalendarElement = () => (
    <StyledCalendar
      isMobile={isMobile}
      selectedDate={date}
      setSelectedDate={handleChange}
      onChange={closeCalendar}
      forwardedRef={calendarRef}
      minDate={minDate}
      maxDate={maxDate}
      locale={locale}
      initialDate={openDate}
    />
  );

  const handleClick = (e: any) => {
    if (
      e.target.classList.contains("nav-thumb-vertical") ||
      e.target.classList.contains("nav-thumb-horizontal")
    ) {
      return;
    }

    // @ts-expect-error TS(2339): Property 'contains' does not exist on type 'never'... Remove this comment to see the full error message
    !selectorRef?.current?.contains(e.target) &&
      // @ts-expect-error TS(2339): Property 'contains' does not exist on type 'never'... Remove this comment to see the full error message
      !calendarRef?.current?.contains(e.target) &&
      // @ts-expect-error TS(2339): Property 'contains' does not exist on type 'never'... Remove this comment to see the full error message
      !selectedItemRef?.current?.contains(e.target) &&
      setIsCalendarOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick, { capture: true });
    return () =>
      document.removeEventListener("mousedown", handleClick, { capture: true });
  }, []);

  useEffect(() => {
    if (
      outerDate &&
      moment(outerDate).format("YYYY-MM-D HH:mm") !==
        moment(date).format("YYYY-MM-D HH:mm")
    ) {
      setDate(outerDate);
    }
  }, [outerDate]);

  return (
    <Wrapper className={className} id={id}>
      {!date ? (
        <>
          // @ts-expect-error TS(2769): No overload matches this call.
          <DateSelector onClick={toggleCalendar} ref={selectorRef}>
            <SelectorAddButton
              title={selectDateText}
              className="mr-8 add-delivery-date-button"
              iconName={CalendarIconUrl}
            />
            // @ts-expect-error TS(2322): Type '{ children: any; isInline: true; fontWeight:... Remove this comment to see the full error message
            <Text isInline fontWeight={600} color="#A3A9AE">
              {selectDateText}
            </Text>
          </DateSelector>
        </>
      ) : (
        <SelectedItem
          className="selectedItem"
          onClose={deleteSelectedDate}
          label={
            showCalendarIcon ? (
              <SelectedLabel>
                <CalendarIcon className="calendarIcon" />
                {date.format("DD MMM YYYY")}
              </SelectedLabel>
            ) : (
              date.format("DD MMM YYYY")
            )
          }
          onClick={toggleCalendar}
          forwardedRef={selectedItemRef}
        />
      )}

      {isCalendarOpen && <CalendarElement />}
    </Wrapper>
  );
};

DatePicker.propTypes = {
  /** Allows to change select date text */
  selectDateText: PropTypes.string,
  /** Selected date */
  initialDate: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  /** Allow you to handle changing events of component */
  onChange: PropTypes.func.isRequired,
  /** Allows to set classname */
  className: PropTypes.string,
  /** Allows to set id */
  id: PropTypes.string,
  /** Specifies min choosable calendar date */
  minDate: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  /** Specifies max choosable calendar date */
  maxDate: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  /** Specifies calendar locale */
  locale: PropTypes.string,
  /** Shows calendar icon in selected item */
  showCalendarIcon: PropTypes.bool,
  /** Allows to track date outside the component */
  outerDate: PropTypes.object,
  /** Allows to set first shown date in calendar */
  openDate: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
};

DatePicker.defaultProps = {
  selectDateText: "Select date",
  showCalendarIcon: true,
};

export default DatePicker;
