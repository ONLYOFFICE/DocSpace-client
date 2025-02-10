// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

// import React from "react";
// import moment from "moment";
// import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// import { Weekdays, Days, Day } from "./sub-components/";
// import { Calendar } from "./Calendar";

// const baseCalendarProps = {
//   isDisabled: false,
//   themeColor: "",
//   selectedDate: moment(),
//   openToDate: moment(),
//   minDate: new Date("1970/01/01"),
//   maxDate: new Date("3000/01/01"),
//   locale: "en",
//   onChange: () => jest.fn(),
// };

// const baseWeekdaysProps = {
//   optionsWeekdays: [
//     { key: "en_0", value: "Mo", color: "" },
//     { key: "en_1", value: "Tu", color: "" },
//     { key: "en_2", value: "We", color: "" },
//     { key: "en_3", value: "Th", color: "" },
//     { key: "en_4", value: "Fr", color: "" },
//     { key: "en_5", value: "Sa", color: "" },
//     { key: "en_6", value: "Su", color: "" },
//   ],
//   size: "base",
// };

// const baseDaysProps = {
//   optionsDays: [
//     {
//       className: "calendar-month_neighboringMonth",
//       dayState: "prev",
//       disableClass: null,
//       value: 25,
//     },
//     {
//       className: "calendar-month_neighboringMonth",
//       dayState: "prev",
//       disableClass: null,
//       value: 26,
//     },
//   ],
//   onDayClick: jest.fn,
//   size: "base",
// };

// const baseDayProps = {
//   day: {
//     className: "calendar-month_neighboringMonth",
//     dayState: "prev",
//     disableClass: null,
//     value: 26,
//   },
//   onDayClick: jest.fn(),
//   size: "base",
// };

// const options = [
//   { key: 0, value: "one" },
//   { key: 1, value: "two" },
//   { key: 2, value: "three" },
// ];
// const baseComboBoxProps = {
//   options: options,
//   selectedOption: { key: 0, value: "one" },
// };

// const selectedDate = new Date("09/12/2019");
// const openToDate = new Date("09/12/2019");
// const minDate = new Date("01/01/1970");
// const maxDate = new Date("01/01/2020");

// describe("Weekdays tests:", () => {
//   it("Weekdays renders without error", () => {
//     const wrapper = mount(<Weekdays {...baseWeekdaysProps} />);
//     expect(wrapper).toExist();
//   });

//   it("Weekdays not re-render test", () => {
//     const wrapper = shallow(<Weekdays {...baseWeekdaysProps} />).instance();
//     const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);
//     expect(shouldUpdate).toBe(false);
//   });

//   it("Weekdays render test", () => {
//     const wrapper = shallow(<Weekdays {...baseWeekdaysProps} />).instance();
//     const shouldUpdate = wrapper.shouldComponentUpdate({
//       ...wrapper.props,
//       size: "big",
//     });
//     expect(shouldUpdate).toBe(true);
//   });

//   it("Weekdays property size passed", () => {
//     const wrapper = mount(<Weekdays {...baseWeekdaysProps} size={"big"} />);
//     expect(wrapper.prop("size")).toEqual("big");
//   });
// });

// describe("Days tests:", () => {
//   it("Days renders without error", () => {
//     const wrapper = mount(<Days {...baseDaysProps} />);
//     expect(wrapper).toExist();
//   });

//   it("Days not re-render test", () => {
//     const wrapper = shallow(<Days {...baseDaysProps} />).instance();
//     const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);
//     expect(shouldUpdate).toBe(false);
//   });

//   it("Days render test", () => {
//     const wrapper = shallow(<Days {...baseDaysProps} />).instance();
//     const shouldUpdate = wrapper.shouldComponentUpdate({
//       ...wrapper.props,
//       size: "big",
//     });
//     expect(shouldUpdate).toBe(true);
//   });

//   it("Days property size passed", () => {
//     const wrapper = mount(<Days {...baseDaysProps} size={"big"} />);
//     expect(wrapper.prop("size")).toEqual("big");
//   });
// });

// describe("Day tests:", () => {
//   it("Day renders without error", () => {
//     const wrapper = mount(<Day {...baseDayProps} />);
//     expect(wrapper).toExist();
//   });

//   it("Day not re-render test", () => {
//     const wrapper = shallow(<Day {...baseDayProps} />).instance();
//     const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);
//     expect(shouldUpdate).toBe(false);
//   });

//   it("Day render test", () => {
//     const wrapper = shallow(<Day {...baseDayProps} />).instance();
//     const shouldUpdate = wrapper.shouldComponentUpdate({
//       ...wrapper.props,
//       size: "big",
//     });
//     expect(shouldUpdate).toBe(true);
//   });

//   it("Day property size passed", () => {
//     const wrapper = mount(<Day {...baseDayProps} size={"big"} />);
//     expect(wrapper.prop("size")).toEqual("big");
//   });
// });

describe("Calendar tests:", () => {
  it("Calendar renders without error", () => {});

  // it("Calendar selectedDate test", () => {
  //   const wrapper = mount(
  //     <Calendar {...baseCalendarProps} selectedDate={selectedDate} />,
  //   );
  //   expect(wrapper.props().selectedDate).toEqual(selectedDate);
  // });

  // it("Calendar openToDate test", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ openToDate: Date; isDisabled: boolean; the... Remove this comment to see the full error message
  //     <Calendar {...baseCalendarProps} openToDate={openToDate} />,
  //   );
  //   expect(wrapper.props().openToDate).toEqual(openToDate);
  // });

  // it("Calendar minDate test", () => {
  //   const wrapper = mount(
  //     <Calendar {...baseCalendarProps} minDate={minDate} />,
  //   );
  //   expect(wrapper.props().minDate).toEqual(minDate);
  // });

  // it("Calendar maxDate test", () => {
  //   const wrapper = mount(
  //     <Calendar {...baseCalendarProps} maxDate={maxDate} />,
  //   );
  //   expect(wrapper.props().maxDate).toEqual(maxDate);
  // });

  // it("Calendar themeColor test", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ themeColor: string; isDisabled: boolean; s... Remove this comment to see the full error message
  //     <Calendar {...baseCalendarProps} themeColor={""} />,
  //   );
  //   expect(wrapper.props().themeColor).toEqual("");
  // });

  // it("Calendar locale test", () => {
  //   const wrapper = mount(<Calendar {...baseCalendarProps} locale={"en-GB"} />);
  //   expect(wrapper.prop("locale")).toEqual("en-GB");
  // });

  // it("Calendar size test", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isDisabled: boolean; themeCo... Remove this comment to see the full error message
  //   const wrapper = shallow(<Calendar {...baseCalendarProps} size="big" />);
  //   expect(wrapper.prop("size")).toEqual("big");
  // });

  // it("Calendar disabled when isDisabled is passed", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; themeColor: string; s... Remove this comment to see the full error message
  //     <Calendar {...baseCalendarProps} isDisabled={true} />,
  //   );
  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });
  // it("Calendar has rendered content ComboBox", () => {
  //   const wrapper = mount(<Calendar {...baseCalendarProps} />);
  //   expect(wrapper).toExist(<ComboBox {...baseComboBoxProps} />);
  // });

  // it("Calendar check the onChange callback", () => {
  //   const onChange = jest.fn();
  //   const props = {
  //     selectedDate: new Date("03/03/2000"),
  //     onChange,
  //   };
  //   const wrapper = shallow(<Calendar {...props} />).instance();
  //   wrapper.onDayClick({
  //     value: 1,
  //     disableClass: "",
  //     className: "",
  //     dayState: "prev",
  //   });
  //   expect(onChange).toBeCalled();

  //   const wrapper2 = shallow(<Calendar {...props} />).instance();
  //   wrapper2.onDayClick({
  //     value: 1,
  //     disableClass: "",
  //     className: "",
  //     dayState: "next",
  //   });
  //   expect(onChange).toBeCalled();

  //   const wrapper3 = shallow(<Calendar {...props} />).instance();
  //   wrapper3.onDayClick({
  //     value: 1,
  //     disableClass: "",
  //     className: "",
  //     dayState: "now",
  //   });
  //   expect(onChange).toBeCalled();
  // });

  // it("Calendar check onSelectYear function", () => {
  //   const props = {
  //     openToDate: new Date("05/01/2000"),
  //     selectedDate: new Date("01/01/2000"),
  //     minDate: new Date("01/01/1970"),
  //     maxDate: new Date("01/01/2020"),
  //   };

  //   const wrapper = shallow(<Calendar {...props} />).instance();
  //   wrapper.onSelectYear({
  //     key: 2020,
  //     value: 2020,
  //   });

  //   expect(wrapper.state.openToDate).toEqual(new Date("01/01/2020"));
  // });

  // it("Calendar check onSelectMonth function", () => {
  //   const props = {
  //     openToDate: new Date("01/01/2000"),
  //     selectedDate: new Date("01/01/2000"),
  //   };
  //   const wrapper = shallow(<Calendar {...props} />).instance();
  //   wrapper.onSelectMonth({ key: "1", label: "February", disabled: false });

  //   expect(wrapper.state.openToDate).toEqual(new Date("02/01/2000"));
  // });

  // it("Calendar check Compare dates function", () => {
  //   const date = new Date();
  //   const wrapper = shallow(<Calendar {...baseCalendarProps} />).instance();
  //   expect(wrapper.compareDates(date, date) === 0).toEqual(true);
  //   expect(wrapper.compareDates(date, new Date("01/01/2000")) === 0).toEqual(
  //     false,
  //   );
  // });

  // it("Calendar error date test", () => {
  //   const wrapper = shallow(<Calendar {...baseCalendarProps} />);
  //   wrapper.setState({ hasError: true, isDisabled: true });
  //   expect(wrapper.instance().state.hasError).toEqual(true);
  //   expect(wrapper.instance().state.isDisabled).toEqual(true);
  // });

  // it("Calendar not error date test", () => {
  //   const wrapper = shallow(<Calendar {...baseCalendarProps} />);
  //   wrapper.setState({ hasError: false, isDisabled: false });
  //   expect(wrapper.instance().state.hasError).toEqual(false);
  // });

  // it("Calendar componentDidUpdate() test", () => {
  //   const wrapper = mount(<Calendar {...baseCalendarProps} />).instance();
  //   wrapper.componentDidUpdate(wrapper.props, wrapper.state);

  //   const wrapper2 = mount(
  //     <Calendar {...baseCalendarProps} selectedDate={new Date("01/01/1910")} />,
  //   ).instance();

  //   expect(wrapper.props).toBe(wrapper.props);
  //   expect(wrapper.state).toBe(wrapper.state);

  //   expect(wrapper2.props).toBe(wrapper2.props);
  //   expect(wrapper2.state).toBe(wrapper2.state);
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(<Calendar {...baseCalendarProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<Calendar {...baseCalendarProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <Calendar {...baseCalendarProps} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
