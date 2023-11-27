import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import DatePicker from "./";
import NewCalendar from "../calendar";
import InputBlock from "../input-block";
import moment from "moment";

const selectedDate = new Date("09/12/2019");
const minDate = new Date("01/01/1970");
const maxDate = new Date("01/01/2020");
// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("DatePicker tests", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker renders without error", () => {
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{}' but re... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker disabled when isDisabled is passed", () => {
    // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; }' is not assignable ... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker isDisabled={true} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isDisabled")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker opened when inOpen is passed", () => {
    // @ts-expect-error TS(2322): Type '{ inOpen: boolean; }' is not assignable to t... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker inOpen={true} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("inOpen")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker  has rendered content NewCalendar", () => {
    // @ts-expect-error TS(2322): Type '{ inOpen: boolean; }' is not assignable to t... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker inOpen={true} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist(<NewCalendar />);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker has rendered content InputBlock", () => {
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{}' but re... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist(<InputBlock />);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker hasError is passed", () => {
    // @ts-expect-error TS(2322): Type '{ hasError: boolean; }' is not assignable to... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker hasError={true} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("hasError")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker disabled when isReadOnly is passed", () => {
    // @ts-expect-error TS(2322): Type '{ isReadOnly: boolean; }' is not assignable ... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker isReadOnly={true} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isReadOnly")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker minDate test", () => {
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{ minDate:... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker minDate={minDate} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().minDate).toEqual(minDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker maxDate test", () => {
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{ maxDate:... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker maxDate={maxDate} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().maxDate).toEqual(maxDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker selectedDate test", () => {
    // @ts-expect-error TS(2322): Type '{ selectedDate: Date; }' is not assignable t... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker selectedDate={selectedDate} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().selectedDate).toEqual(selectedDate);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker themeColor test", () => {
    // @ts-expect-error TS(2322): Type '{ themeColor: string; }' is not assignable t... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker themeColor={"#fff"} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().themeColor).toEqual("#fff");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker input mask test", () => {
    const mask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
    // @ts-expect-error TS(2322): Type '{ mask: (string | RegExp)[]; }' is not assig... Remove this comment to see the full error message
    const wrapper = mount(<InputBlock mask={mask} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().mask).toBe(mask);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().mask).toEqual(mask);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker locale test", () => {
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{ locale: ... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker locale={"en-GB"} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("locale")).toEqual("en-GB");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker input value with locale test", () => {
    moment.locale("ru");
    const value = moment(selectedDate).format("L");
    // @ts-expect-error TS(2322): Type '{ value: string; }' is not assignable to typ... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker value={value} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().value).toEqual("12.09.2019");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker check the onChange callback", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const props = {
      value: "03/03/2000",
      onChange,
    };
    const wrapper = mount(<DatePicker {...props} />).find("input");
    wrapper.simulate("change", { target: { value: "09/09/2019" } });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(new Date("09/09/2019"));
  });

  /*it("check DatePicker popup open", () => {
    const onFocus = jest.fn(() => true);
    const wrapper = mount(<DatePicker onFocus={onFocus} isOpen={false} />);
    const input = wrapper.find("input");
    input.simulate("focus");

    const instance = wrapper.instance();
    expect(instance.state.isOpen).toEqual(true);
  });*/

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker check the Calendar onChange callback", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const props = {
      value: "03/03/2000",
      isOpen: true,
      onChange,
    };
    const wrapper = mount(<DatePicker {...props} />);

    const days = wrapper.find(".calendar-month");

    days.first().simulate("click", { target: { value: 1 } });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker check Compare date function", () => {
    const date = new Date();
    const errorDate = new Date("01/01/3000");
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{}' but re... Remove this comment to see the full error message
    const wrapper = shallow(<DatePicker />).instance();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.compareDate(date)).toEqual(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.compareDate(errorDate)).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker check Compare dates function", () => {
    const date = new Date();
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{}' but re... Remove this comment to see the full error message
    const wrapper = shallow(<DatePicker />).instance();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.compareDates(date, date) === 0).toEqual(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.compareDates(date, new Date("01/01/2000")) === 0).toEqual(
      false
    );
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker check is valid dates function", () => {
    var date = new Date();
    date.setFullYear(1);
    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{}' but re... Remove this comment to see the full error message
    const wrapper = shallow(<DatePicker />).instance();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.isValidDate(selectedDate, maxDate, minDate, false)).toEqual(
      false
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.isValidDate(date, maxDate, minDate, false)).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("DatePicker componentDidUpdate() lifecycle test", () => {
    const props = {
      selectedDate: new Date(),
      minDate: new Date("01/01/1970"),
      maxDate: new Date("01/01/2030"),
      isOpen: true,
      isDisabled: false,
      isReadOnly: false,
      hasError: false,
      themeColor: "#ED7309",
      locale: "en",
    };

    var date = new Date();
    date.setFullYear(1);

    // @ts-expect-error TS(2741): Property 'onChange' is missing in type '{ selected... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker {...props} />).instance();
    wrapper.componentDidUpdate(wrapper.props, wrapper.state);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props).toBe(wrapper.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state).toBe(wrapper.state);

    const wrapper2 = mount(
      <DatePicker
        {...props}
        // @ts-expect-error TS(2322): Type '{ selectedDate: Date; hasError: boolean; siz... Remove this comment to see the full error message
        selectedDate={date}
        hasError={false}
        size="big"
        isDisabled={false}
      />
    ).instance();

    wrapper2.componentDidUpdate(wrapper2.props, wrapper2.state);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper2.props).toBe(wrapper2.props);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper2.state).toBe(wrapper2.state);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentWillUnmount() lifecycle  test", () => {
    // @ts-expect-error TS(2322): Type '{ isOpen: boolean; }' is not assignable to t... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker isOpen={true} />);
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const componentWillUnmount = jest.spyOn(
      wrapper.instance(),
      "componentWillUnmount"
    );

    wrapper.unmount();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ isOpen: boolean; id: string; }' is not ass... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker isOpen={true} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ isOpen: boolean; className: string; }' is ... Remove this comment to see the full error message
    const wrapper = mount(<DatePicker isOpen={true} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ isOpen: boolean; style: { color: string; }... Remove this comment to see the full error message
      <DatePicker isOpen={true} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
