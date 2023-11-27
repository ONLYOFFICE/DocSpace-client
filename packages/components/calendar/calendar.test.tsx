import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
// @ts-expect-error TS(2305): Module '"./sub-components/"' has no exported membe... Remove this comment to see the full error message
import { Weekdays, Days, Day } from "./sub-components/";
import Calendar from "./";
import ComboBox from "../combobox";

const baseCalendarProps = {
  isDisabled: false,
  themeColor: "#ED7309",
  selectedDate: new Date(),
  openToDate: new Date(),
  minDate: new Date("1970/01/01"),
  maxDate: new Date("3000/01/01"),
  locale: "en",
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onChange: () => jest.fn(),
};

const baseWeekdaysProps = {
  optionsWeekdays: [
    { key: "en_0", value: "Mo", color: "" },
    { key: "en_1", value: "Tu", color: "" },
    { key: "en_2", value: "We", color: "" },
    { key: "en_3", value: "Th", color: "" },
    { key: "en_4", value: "Fr", color: "" },
    { key: "en_5", value: "Sa", color: "#A3A9AE" },
    { key: "en_6", value: "Su", color: "#A3A9AE" },
  ],
  size: "base",
};

const baseDaysProps = {
  optionsDays: [
    {
      className: "calendar-month_neighboringMonth",
      dayState: "prev",
      disableClass: null,
      value: 25,
    },
    {
      className: "calendar-month_neighboringMonth",
      dayState: "prev",
      disableClass: null,
      value: 26,
    },
  ],
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onDayClick: jest.fn,
  size: "base",
};

const baseDayProps = {
  day: {
    className: "calendar-month_neighboringMonth",
    dayState: "prev",
    disableClass: null,
    value: 26,
  },
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onDayClick: jest.fn(),
  size: "base",
};

const options = [
  { key: 0, value: "one" },
  { key: 1, value: "two" },
  { key: 2, value: "three" },
];
const baseComboBoxProps = {
  options: options,
  selectedOption: { key: 0, value: "one" },
};

const selectedDate = new Date("09/12/2019");
const openToDate = new Date("09/12/2019");
const minDate = new Date("01/01/1970");
const maxDate = new Date("01/01/2020");

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Weekdays tests:", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Weekdays renders without error", () => {
    const wrapper = mount(<Weekdays {...baseWeekdaysProps} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Weekdays not re-render test", () => {
    const wrapper = shallow(<Weekdays {...baseWeekdaysProps} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Weekdays render test", () => {
    const wrapper = shallow(<Weekdays {...baseWeekdaysProps} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate({
      ...wrapper.props,
      size: "big",
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Weekdays property size passed", () => {
    const wrapper = mount(<Weekdays {...baseWeekdaysProps} size={"big"} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("big");
  });
});

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Days tests:", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Days renders without error", () => {
    const wrapper = mount(<Days {...baseDaysProps} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Days not re-render test", () => {
    const wrapper = shallow(<Days {...baseDaysProps} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Days render test", () => {
    const wrapper = shallow(<Days {...baseDaysProps} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate({
      ...wrapper.props,
      size: "big",
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Days property size passed", () => {
    const wrapper = mount(<Days {...baseDaysProps} size={"big"} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("big");
  });
});

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Day tests:", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Day renders without error", () => {
    const wrapper = mount(<Day {...baseDayProps} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Day not re-render test", () => {
    const wrapper = shallow(<Day {...baseDayProps} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Day render test", () => {
    const wrapper = shallow(<Day {...baseDayProps} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate({
      ...wrapper.props,
      size: "big",
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Day property size passed", () => {
    const wrapper = mount(<Day {...baseDayProps} size={"big"} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("big");
  });
});

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Calendar tests:", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar renders without error", () => {
    const wrapper = mount(<Calendar {...baseCalendarProps} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar selectedDate test", () => {
    const wrapper = mount(
      <Calendar {...baseCalendarProps} selectedDate={selectedDate} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().selectedDate).toEqual(selectedDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar openToDate test", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ openToDate: Date; isDisabled: boolean; the... Remove this comment to see the full error message
      <Calendar {...baseCalendarProps} openToDate={openToDate} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().openToDate).toEqual(openToDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar minDate test", () => {
    const wrapper = mount(
      <Calendar {...baseCalendarProps} minDate={minDate} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().minDate).toEqual(minDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar maxDate test", () => {
    const wrapper = mount(
      <Calendar {...baseCalendarProps} maxDate={maxDate} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().maxDate).toEqual(maxDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar themeColor test", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ themeColor: string; isDisabled: boolean; s... Remove this comment to see the full error message
      <Calendar {...baseCalendarProps} themeColor={"#fff"} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().themeColor).toEqual("#fff");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar locale test", () => {
    const wrapper = mount(<Calendar {...baseCalendarProps} locale={"en-GB"} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("locale")).toEqual("en-GB");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar size test", () => {
    // @ts-expect-error TS(2322): Type '{ size: string; isDisabled: boolean; themeCo... Remove this comment to see the full error message
    const wrapper = shallow(<Calendar {...baseCalendarProps} size="big" />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("big");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar disabled when isDisabled is passed", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; themeColor: string; s... Remove this comment to see the full error message
      <Calendar {...baseCalendarProps} isDisabled={true} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isDisabled")).toEqual(true);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar has rendered content ComboBox", () => {
    const wrapper = mount(<Calendar {...baseCalendarProps} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist(<ComboBox {...baseComboBoxProps} />);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar check the onChange callback", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const props = {
      selectedDate: new Date("03/03/2000"),
      onChange,
    };
    const wrapper = shallow(<Calendar {...props} />).instance();
    wrapper.onDayClick({
      value: 1,
      disableClass: "",
      className: "",
      dayState: "prev",
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onChange).toBeCalled();

    const wrapper2 = shallow(<Calendar {...props} />).instance();
    wrapper2.onDayClick({
      value: 1,
      disableClass: "",
      className: "",
      dayState: "next",
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onChange).toBeCalled();

    const wrapper3 = shallow(<Calendar {...props} />).instance();
    wrapper3.onDayClick({
      value: 1,
      disableClass: "",
      className: "",
      dayState: "now",
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onChange).toBeCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar check onSelectYear function", () => {
    const props = {
      openToDate: new Date("05/01/2000"),
      selectedDate: new Date("01/01/2000"),
      minDate: new Date("01/01/1970"),
      maxDate: new Date("01/01/2020"),
    };

    const wrapper = shallow(<Calendar {...props} />).instance();
    wrapper.onSelectYear({
      key: 2020,
      value: 2020,
    });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.openToDate).toEqual(new Date("01/01/2020"));
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar check onSelectMonth function", () => {
    const props = {
      openToDate: new Date("01/01/2000"),
      selectedDate: new Date("01/01/2000"),
    };
    const wrapper = shallow(<Calendar {...props} />).instance();
    wrapper.onSelectMonth({ key: "1", label: "February", disabled: false });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.openToDate).toEqual(new Date("02/01/2000"));
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar check Compare dates function", () => {
    const date = new Date();
    const wrapper = shallow(<Calendar {...baseCalendarProps} />).instance();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.compareDates(date, date) === 0).toEqual(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.compareDates(date, new Date("01/01/2000")) === 0).toEqual(
      false
    );
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar error date test", () => {
    const wrapper = shallow(<Calendar {...baseCalendarProps} />);
    wrapper.setState({ hasError: true, isDisabled: true });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.instance().state.hasError).toEqual(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.instance().state.isDisabled).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar not error date test", () => {
    const wrapper = shallow(<Calendar {...baseCalendarProps} />);
    wrapper.setState({ hasError: false, isDisabled: false });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.instance().state.hasError).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Calendar componentDidUpdate() test", () => {
    const wrapper = mount(<Calendar {...baseCalendarProps} />).instance();
    wrapper.componentDidUpdate(wrapper.props, wrapper.state);

    const wrapper2 = mount(
      <Calendar {...baseCalendarProps} selectedDate={new Date("01/01/1910")} />
    ).instance();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props).toBe(wrapper.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state).toBe(wrapper.state);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper2.props).toBe(wrapper2.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper2.state).toBe(wrapper2.state);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(<Calendar {...baseCalendarProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(<Calendar {...baseCalendarProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      <Calendar {...baseCalendarProps} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});