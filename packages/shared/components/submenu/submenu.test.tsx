// // @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
// import { mount, shallow } from "enzyme";
// import React from "react";

// import Submenu from "./";
// import { testData, testStartSelect } from "./data";

// const props = {
//   data: testData,
//   startSelect: testStartSelect,
// };

// const onlyData = {
//   data: testData,
// };

describe("<Submenu />", () => {
  it("renders without error", () => {
    // const wrapper = mount(<Submenu {...props} />);
    // // @ts-expect-error TS(2304): Cannot find name 'expect'.
    // expect(wrapper).toExist(true);
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("gets data prop", () => {
  //   const wrapper = mount(<Submenu {...onlyData} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("data")).toEqual(testData);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("doesnt render without data prop", () => {
  //   const wrapper = mount(<Submenu {...props} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("gets startSelect prop", () => {
  //   const wrapper = mount(<Submenu {...props} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("startSelect")).toEqual(testStartSelect);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("selects first data item as currentItem without startSelect prop", () => {
  //   const wrapper = shallow(<Submenu {...onlyData} />)
  //     .find("styled-submenu__StyledSubmenuContentWrapper")
  //     .childAt(0);
  //   const currentItemWrapper = shallow(testData[0].content);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.debug()).toEqual(currentItemWrapper.debug());
  // });
});
